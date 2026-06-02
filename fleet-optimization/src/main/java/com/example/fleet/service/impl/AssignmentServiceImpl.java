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

    public AssignmentServiceImpl(AssignmentRepository assignmentRepository, UserRepository userRepository, VehicleRepository vehicleRepository, RouteRepository routeRepository) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.routeRepository = routeRepository;
    }

    @Override
    @Transactional
    public AssignmentDto createAssignment(CreateAssignmentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new RuntimeException("Route not found"));

        if (!"IDLE".equals(vehicle.getStatus())) {
            throw new RuntimeException("Vehicle is not available");
        }

        Assignment assignment = new Assignment();
        assignment.setUser(user);
        assignment.setVehicle(vehicle);
        assignment.setRoute(route);
        assignment.setDate(request.getDate());
        assignment.setStatus("PENDING");

        // Update vehicle status
        vehicle.setStatus("ACTIVE");
        vehicleRepository.save(vehicle);

        Assignment savedAssignment = assignmentRepository.save(assignment);
        return mapToDto(savedAssignment);
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

        // Free up the vehicle
        Vehicle vehicle = assignment.getVehicle();
        vehicle.setStatus("IDLE");
        vehicleRepository.save(vehicle);

        assignment.setStatus("COMPLETED");
        Assignment updatedAssignment = assignmentRepository.save(assignment);
        
        return mapToDto(updatedAssignment);
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

        RouteDto routeDto = new RouteDto();
        routeDto.setId(assignment.getRoute().getId());
        routeDto.setStartLocation(assignment.getRoute().getStartLocation());
        routeDto.setEndLocation(assignment.getRoute().getEndLocation());
        routeDto.setDistanceKm(assignment.getRoute().getDistanceKm());

        AssignmentDto dto = new AssignmentDto();
        dto.setId(assignment.getId());
        dto.setUser(userDto);
        dto.setVehicle(vehicleDto);
        dto.setRoute(routeDto);
        dto.setDate(assignment.getDate());
        dto.setStatus(assignment.getStatus());
        
        return dto;
    }
}
