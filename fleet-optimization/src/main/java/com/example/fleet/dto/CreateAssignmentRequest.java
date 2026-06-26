package com.example.fleet.dto;

import java.time.LocalDate;

public class CreateAssignmentRequest {
    private Long userId;
    private Long vehicleId;
    private Long routeId;
    private LocalDate date;

    public CreateAssignmentRequest() {}

    public CreateAssignmentRequest(Long userId, Long vehicleId, Long routeId, LocalDate date) {
        this.userId = userId;
        this.vehicleId = vehicleId;
        this.routeId = routeId;
        this.date = date;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public Long getRouteId() { return routeId; }
    public void setRouteId(Long routeId) { this.routeId = routeId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
