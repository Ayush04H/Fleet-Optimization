package com.example.fleet.service.impl;

import com.example.fleet.dto.VehicleDto;
import com.example.fleet.entity.Vehicle;
import com.example.fleet.repository.VehicleRepository;
import com.example.fleet.service.VehicleService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleServiceImpl(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public VehicleDto addVehicle(VehicleDto vehicleDto) {
        Vehicle vehicle = new Vehicle();
        vehicle.setRegistrationNumber(vehicleDto.getRegistrationNumber());
        vehicle.setCapacity(vehicleDto.getCapacity());
        vehicle.setStatus("IDLE"); // Default status
        vehicle.setCurrentMileage(0.0);
        vehicle.setMaintenanceThreshold(vehicleDto.getMaintenanceThreshold() != null ? vehicleDto.getMaintenanceThreshold() : 10000.0);

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return mapToDto(savedVehicle);
    }

    @Override
    public List<VehicleDto> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDto> getAvailableVehicles() {
        return vehicleRepository.findByStatus("IDLE")
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleDto performMaintenance(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        vehicle.setCurrentMileage(0.0);
        vehicle.setStatus("IDLE");
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return mapToDto(savedVehicle);
    }

    private VehicleDto mapToDto(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.setId(vehicle.getId());
        dto.setRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setCapacity(vehicle.getCapacity());
        dto.setStatus(vehicle.getStatus());
        dto.setCurrentMileage(vehicle.getCurrentMileage());
        dto.setMaintenanceThreshold(vehicle.getMaintenanceThreshold());
        return dto;
    }
}
