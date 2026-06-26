package com.example.fleet.controller;

import com.example.fleet.dto.AssignmentDto;
import com.example.fleet.dto.CreateAssignmentRequest;
import com.example.fleet.service.AssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping({"", "/create"})
    public ResponseEntity<AssignmentDto> createAssignment(@RequestBody CreateAssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.createAssignment(request));
    }

    @GetMapping
    public ResponseEntity<List<AssignmentDto>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsForUser(userId));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<AssignmentDto> completeAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.completeAssignment(id));
    }
}
