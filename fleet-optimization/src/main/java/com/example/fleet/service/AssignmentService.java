package com.example.fleet.service;

import com.example.fleet.dto.AssignmentDto;
import com.example.fleet.dto.CreateAssignmentRequest;

import java.util.List;

public interface AssignmentService {
    
    // Create a new assignment and update vehicle status
    AssignmentDto createAssignment(CreateAssignmentRequest request);
    
    // Fetch all assignments (for Admin)
    List<AssignmentDto> getAllAssignments();
    
    // Fetch assignments for a specific driver
    List<AssignmentDto> getAssignmentsForUser(Long userId);
    
    // Complete an assignment and free up the vehicle
    AssignmentDto completeAssignment(Long id);
}
