package com.example.fleet.repository;

import com.example.fleet.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    // Custom method to fetch assignments for a specific user/driver
    List<Assignment> findByUserId(Long userId);
}
