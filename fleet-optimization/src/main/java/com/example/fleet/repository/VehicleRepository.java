package com.example.fleet.repository;

import com.example.fleet.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    // Find vehicles by their current status (e.g., IDLE)
    List<Vehicle> findByStatus(String status);
}
