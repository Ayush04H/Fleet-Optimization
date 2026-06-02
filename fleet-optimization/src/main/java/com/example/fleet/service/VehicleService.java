package com.example.fleet.service;

import com.example.fleet.dto.VehicleDto;

import java.util.List;

public interface VehicleService {
    // Add a new vehicle
    VehicleDto addVehicle(VehicleDto vehicleDto);

    // Get all vehicles
    List<VehicleDto> getAllVehicles();

    // Get available (IDLE) vehicles
    List<VehicleDto> getAvailableVehicles();
}
