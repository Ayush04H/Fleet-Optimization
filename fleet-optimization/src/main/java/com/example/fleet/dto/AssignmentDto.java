package com.example.fleet.dto;

import java.time.LocalDate;

public class AssignmentDto {
    private Long id;
    private UserDto user;
    private VehicleDto vehicle;
    private RouteDto route;
    private LocalDate date;
    private String status;
    private String delayReason;

    public AssignmentDto() {}

    public AssignmentDto(Long id, UserDto user, VehicleDto vehicle, RouteDto route, LocalDate date, String status) {
        this.id = id;
        this.user = user;
        this.vehicle = vehicle;
        this.route = route;
        this.date = date;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public VehicleDto getVehicle() { return vehicle; }
    public void setVehicle(VehicleDto vehicle) { this.vehicle = vehicle; }

    public RouteDto getRoute() { return route; }
    public void setRoute(RouteDto route) { this.route = route; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDelayReason() { return delayReason; }
    public void setDelayReason(String delayReason) { this.delayReason = delayReason; }
}
