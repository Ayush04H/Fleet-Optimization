package com.example.fleet.dto;

public class UserDto {
    private Long id;
    private String username;
    private String role;

    public UserDto() {}

    public UserDto(Long id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return username; }
    public void setName(String name) { this.username = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
