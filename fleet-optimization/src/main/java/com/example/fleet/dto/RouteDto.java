package com.example.fleet.dto;

public class RouteDto {
    private Long id;
    private String startLocation;
    private String endLocation;
    private Double distanceKm;
    private Double requiredCapacity;

    public RouteDto() {}

    public RouteDto(Long id, String startLocation, String endLocation, Double distanceKm, Double requiredCapacity) {
        this.id = id;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.distanceKm = distanceKm;
        this.requiredCapacity = requiredCapacity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStartLocation() { return startLocation; }
    public void setStartLocation(String startLocation) { this.startLocation = startLocation; }

    public String getEndLocation() { return endLocation; }
    public void setEndLocation(String endLocation) { this.endLocation = endLocation; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public Double getRequiredCapacity() { return requiredCapacity; }
    public void setRequiredCapacity(Double requiredCapacity) { this.requiredCapacity = requiredCapacity; }
}
