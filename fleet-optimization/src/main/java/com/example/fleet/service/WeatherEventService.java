package com.example.fleet.service;

import com.example.fleet.dto.AssignmentDto;
import com.example.fleet.entity.Assignment;
import com.example.fleet.repository.AssignmentRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class WeatherEventService {

    private final AssignmentRepository assignmentRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherEventService(AssignmentRepository assignmentRepository, SimpMessagingTemplate messagingTemplate) {
        this.assignmentRepository = assignmentRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void monitorWeatherForActiveRoutes() {
        List<Assignment> activeAssignments = assignmentRepository.findByStatus("ACTIVE");

        for (Assignment assignment : activeAssignments) {
            String city = assignment.getRoute().getEndLocation();
            if (city == null || city.isEmpty()) continue;

            try {
                // 1. Geocode city
                String geocodeUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" + city + "&count=1";
                Map<String, Object> geocodeResponse = restTemplate.getForObject(geocodeUrl, Map.class);
                
                if (geocodeResponse != null && geocodeResponse.containsKey("results")) {
                    List<Map<String, Object>> results = (List<Map<String, Object>>) geocodeResponse.get("results");
                    if (!results.isEmpty()) {
                        Double lat = (Double) results.get(0).get("latitude");
                        Double lon = (Double) results.get(0).get("longitude");

                        // 2. Fetch weather
                        String weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=precipitation,wind_speed_10m";
                        Map<String, Object> weatherResponse = restTemplate.getForObject(weatherUrl, Map.class);
                        
                        if (weatherResponse != null && weatherResponse.containsKey("current")) {
                            Map<String, Object> current = (Map<String, Object>) weatherResponse.get("current");
                            
                            // Open-Meteo returns Numbers, we need to carefully parse
                            Number precipNumber = (Number) current.get("precipitation");
                            Number windNumber = (Number) current.get("wind_speed_10m");
                            
                            double precipitation = precipNumber != null ? precipNumber.doubleValue() : 0.0;
                            double windSpeed = windNumber != null ? windNumber.doubleValue() : 0.0;

                            // 3. Evaluate logic (e.g. > 10mm rain or > 40km/h wind)
                            if (precipitation > 10.0 || windSpeed > 40.0) {
                                assignment.setDelayReason("SEVERE WEATHER: Rain " + precipitation + "mm, Wind " + windSpeed + "km/h");
                                assignmentRepository.save(assignment);
                                
                                // Broadcast the delay alert
                                AssignmentDto dto = new AssignmentDto();
                                dto.setId(assignment.getId());
                                dto.setStatus(assignment.getStatus());
                                dto.setDelayReason(assignment.getDelayReason());
                                messagingTemplate.convertAndSend("/topic/alerts", dto);
                                
                            } else if (assignment.getDelayReason() != null) {
                                // Weather cleared
                                assignment.setDelayReason(null);
                                assignmentRepository.save(assignment);
                                
                                AssignmentDto dto = new AssignmentDto();
                                dto.setId(assignment.getId());
                                dto.setStatus(assignment.getStatus());
                                dto.setDelayReason(null);
                                messagingTemplate.convertAndSend("/topic/alerts", dto);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Silently catch exceptions to not break the scheduler
                System.err.println("Failed to fetch weather for " + city + ": " + e.getMessage());
            }
        }
    }
}
