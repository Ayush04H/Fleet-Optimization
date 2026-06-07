package com.example.fleet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class to bootstrap the Spring Boot backend.
 */
@SpringBootApplication
@EnableScheduling
public class FleetOptimizationApplication {

    public static void main(String[] args) {
        SpringApplication.run(FleetOptimizationApplication.class, args);
    }
}
