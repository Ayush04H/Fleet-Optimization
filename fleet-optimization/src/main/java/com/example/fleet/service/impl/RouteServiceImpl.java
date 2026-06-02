package com.example.fleet.service.impl;

import com.example.fleet.dto.RouteDto;
import com.example.fleet.entity.Route;
import com.example.fleet.repository.RouteRepository;
import com.example.fleet.service.RouteService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteServiceImpl implements RouteService {

    private final RouteRepository routeRepository;

    public RouteServiceImpl(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    @Override
    public RouteDto createRoute(RouteDto routeDto) {
        Route route = new Route();
        route.setStartLocation(routeDto.getStartLocation());
        route.setEndLocation(routeDto.getEndLocation());
        route.setDistanceKm(routeDto.getDistanceKm());

        Route savedRoute = routeRepository.save(route);
        return mapToDto(savedRoute);
    }

    @Override
    public List<RouteDto> getAllRoutes() {
        return routeRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private RouteDto mapToDto(Route route) {
        RouteDto dto = new RouteDto();
        dto.setId(route.getId());
        dto.setStartLocation(route.getStartLocation());
        dto.setEndLocation(route.getEndLocation());
        dto.setDistanceKm(route.getDistanceKm());
        return dto;
    }
}
