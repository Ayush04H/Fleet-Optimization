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
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (assignmentRepository.existsByUserIdAndDate(user.getId(), request.getDate())) {
            throw new RuntimeException("Driver is already assigned to a route on this date.");
        }
        
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new RuntimeException("Route not found"));

        if ("MAINTENANCE_REQUIRED".equals(vehicle.getStatus())) {
            throw new RuntimeException("Vehicle requires maintenance and cannot be dispatched");
        }
        if (!"IDLE".equals(vehicle.getStatus())) {
            throw new RuntimeException("Vehicle is not available");
        }

        if (route.getRequiredCapacity() != null && vehicle.getCapacity() != null) {
            if (route.getRequiredCapacity() > vehicle.getCapacity()) {
                throw new RuntimeException("Vehicle capacity is insufficient for this route's cargo load.");
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
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // Free up the vehicle, increment mileage, and calculate profitability
        Vehicle vehicle = assignment.getVehicle();
        Double distance = assignment.getRoute().getDistanceKm();
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

        if (actualCostPerKm > revenue) {
            vehicle.setStatus("RETIREMENT_RECOMMENDED");
        } else if (newMileage >= vehicle.getMaintenanceThreshold()) {
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
