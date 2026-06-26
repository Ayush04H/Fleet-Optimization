package com.example.fleet.dto;

public class VehicleDto {
    private Long id;
    private String registrationNumber;
    private Double capacity;
    private String status;
    private Double currentMileage;
    private Double maintenanceThreshold;
    private Double baseCostPerKm;
    private Double revenuePerKm;
    private Double netProfit;

    public VehicleDto() {}

    public VehicleDto(Long id, String registrationNumber, Double capacity, String status, Double currentMileage, Double maintenanceThreshold) {
        this.id = id;
        this.registrationNumber = registrationNumber;
        this.capacity = capacity;
        this.status = status;
        this.currentMileage = currentMileage;
        this.maintenanceThreshold = maintenanceThreshold;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public Double getCapacity() { return capacity; }
    public void setCapacity(Double capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getCurrentMileage() { return currentMileage; }
    public void setCurrentMileage(Double currentMileage) { this.currentMileage = currentMileage; }

    public Double getMaintenanceThreshold() { return maintenanceThreshold; }
    public void setMaintenanceThreshold(Double maintenanceThreshold) { this.maintenanceThreshold = maintenanceThreshold; }

    public Double getBaseCostPerKm() { return baseCostPerKm; }
    public void setBaseCostPerKm(Double baseCostPerKm) { this.baseCostPerKm = baseCostPerKm; }

    public Double getRevenuePerKm() { return revenuePerKm; }
    public void setRevenuePerKm(Double revenuePerKm) { this.revenuePerKm = revenuePerKm; }

    public Double getNetProfit() { return netProfit; }
    public void setNetProfit(Double netProfit) { this.netProfit = netProfit; }
}
