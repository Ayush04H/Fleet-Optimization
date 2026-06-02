package com.example.fleet.service;

import com.example.fleet.dto.RouteDto;

import java.util.List;

public interface RouteService {
    // Create a new route
    RouteDto createRoute(RouteDto routeDto);

    // Get all routes
    List<RouteDto> getAllRoutes();
}
