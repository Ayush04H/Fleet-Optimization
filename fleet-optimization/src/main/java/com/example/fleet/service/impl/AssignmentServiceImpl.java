package com.example.fleet.service.impl;

import com.example.fleet.dto.AssignmentDto;
import com.example.fleet.dto.CreateAssignmentRequest;
import com.example.fleet.dto.RouteDto;
import com.example.fleet.dto.UserDto;
import com.example.fleet.dto.VehicleDto;
import com.example.fleet.entity.Assignment;
import com.example.fleet.entity.Route;
import com.example.fleet.entity.User;
import com.example.fleet.entity.Vehicle;
import com.example.fleet.exception.BusinessConstraintViolationException;
import com.example.fleet.exception.ResourceNotFoundException;
import com.example.fleet.repository.AssignmentRepository;
import com.example.fleet.repository.RouteRepository;
import com.example.fleet.repository.UserRepository;
import com.example.fleet.repository.VehicleRepository;
import com.example.fleet.service.AssignmentService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final RouteRepository routeRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public AssignmentServiceImpl(AssignmentRepository assignmentRepository, UserRepository userRepository, VehicleRepository vehicleRepository, RouteRepository routeRepository, SimpMessagingTemplate messagingTemplate) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.routeRepository = routeRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public AssignmentDto createAssignment(CreateAssignmentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getUserId()));
        
        if (assignmentRepository.existsByUserIdAndDateAndStatus(user.getId(), request.getDate(), "ACTIVE")) {
            throw new BusinessConstraintViolationException("Driver is currently en route on an active assignment.");
        }
        
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));
        
        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + request.getRouteId()));

        String vStatus = vehicle.getStatus() != null ? vehicle.getStatus() : "IDLE";
        if ("MAINTENANCE_REQUIRED".equals(vStatus) || "RETIREMENT_RECOMMENDED".equals(vStatus)) {
            throw new BusinessConstraintViolationException("Vehicle requires maintenance/retirement and cannot be dispatched.");
        }
        if ("ACTIVE".equals(vStatus)) {
            throw new BusinessConstraintViolationException("Vehicle is currently dispatched on an active route.");
        }

        if (route.getRequiredCapacity() != null && vehicle.getCapacity() != null) {
            if (route.getRequiredCapacity() > vehicle.getCapacity()) {
                throw new BusinessConstraintViolationException("Vehicle capacity is insufficient for this route's cargo load.");
            }
        }

        Assignment assignment = new Assignment();
        assignment.setUser(user);
        assignment.setVehicle(vehicle);
        assignment.setRoute(route);
        assignment.setDate(request.getDate());
        assignment.setStatus("ACTIVE");
        assignment.setDelayReason(null);

        // Lock the vehicle status
        vehicle.setStatus("ACTIVE");
        vehicleRepository.save(vehicle);

        Assignment savedAssignment = assignmentRepository.save(assignment);
        AssignmentDto assignmentDto = mapToDto(savedAssignment);

        // Broadcast the new assignment to the frontend in real-time
        messagingTemplate.convertAndSend("/topic/assignments", assignmentDto);
        
        return assignmentDto;
    }

    @Override
    public List<AssignmentDto> getAllAssignments() {
        return assignmentRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssignmentDto> getAssignmentsForUser(Long userId) {
        return assignmentRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AssignmentDto completeAssignment(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + id));

        // Free up the vehicle, increment mileage, and calculate profitability
        Vehicle vehicle = assignment.getVehicle();
        Double distance = (assignment.getRoute() != null && assignment.getRoute().getDistanceKm() != null) ? assignment.getRoute().getDistanceKm() : 10.0;
        Double currentMileage = vehicle.getCurrentMileage() != null ? vehicle.getCurrentMileage() : 0.0;
        
        // Profitability logic
        Double baseCost = vehicle.getBaseCostPerKm() != null ? vehicle.getBaseCostPerKm() : 1.0;
        Double revenue = vehicle.getRevenuePerKm() != null ? vehicle.getRevenuePerKm() : 2.5;
        
        Double actualCostPerKm = baseCost * (1 + (currentMileage / 10000.0) * 0.05);
        Double tripProfit = (revenue - actualCostPerKm) * distance;
        
        Double currentNetProfit = vehicle.getNetProfit() != null ? vehicle.getNetProfit() : 0.0;
        vehicle.setNetProfit(currentNetProfit + tripProfit);

        Double newMileage = currentMileage + distance;
        vehicle.setCurrentMileage(newMileage);

        Double threshold = vehicle.getMaintenanceThreshold() != null ? vehicle.getMaintenanceThreshold() : 5000.0;
        if (actualCostPerKm > revenue) {
            vehicle.setStatus("RETIREMENT_RECOMMENDED");
        } else if (newMileage >= threshold) {
            vehicle.setStatus("MAINTENANCE_REQUIRED");
        } else {
            vehicle.setStatus("IDLE");
        }
        vehicleRepository.save(vehicle);

        assignment.setStatus("COMPLETED");
        Assignment updatedAssignment = assignmentRepository.save(assignment);
        
        AssignmentDto assignmentDto = mapToDto(updatedAssignment);

        // Broadcast the updated assignment
        messagingTemplate.convertAndSend("/topic/assignments", assignmentDto);
        
        // Also broadcast the vehicle update (since mileage and potentially status changed)
        messagingTemplate.convertAndSend("/topic/vehicles", assignmentDto.getVehicle());
        
        return assignmentDto;
    }

    private AssignmentDto mapToDto(Assignment assignment) {
        UserDto userDto = new UserDto();
        userDto.setId(assignment.getUser().getId());
        userDto.setUsername(assignment.getUser().getUsername());
        userDto.setRole(assignment.getUser().getRole());

        VehicleDto vehicleDto = new VehicleDto();
        vehicleDto.setId(assignment.getVehicle().getId());
        vehicleDto.setRegistrationNumber(assignment.getVehicle().getRegistrationNumber());
        vehicleDto.setCapacity(assignment.getVehicle().getCapacity());
        vehicleDto.setStatus(assignment.getVehicle().getStatus());
        vehicleDto.setCurrentMileage(assignment.getVehicle().getCurrentMileage());
        vehicleDto.setMaintenanceThreshold(assignment.getVehicle().getMaintenanceThreshold());

        RouteDto routeDto = new RouteDto();
        routeDto.setId(assignment.getRoute().getId());
        routeDto.setStartLocation(assignment.getRoute().getStartLocation());
        routeDto.setEndLocation(assignment.getRoute().getEndLocation());
        routeDto.setDistanceKm(assignment.getRoute().getDistanceKm());
        routeDto.setRequiredCapacity(assignment.getRoute().getRequiredCapacity());

        AssignmentDto dto = new AssignmentDto();
        dto.setId(assignment.getId());
        dto.setUser(userDto);
        dto.setVehicle(vehicleDto);
        dto.setRoute(routeDto);
        dto.setDate(assignment.getDate());
        dto.setStatus(assignment.getStatus());
        dto.setDelayReason(assignment.getDelayReason());
        return dto;
    }
}
