package com.example.fleet.service;

import com.example.fleet.dto.UserDto;

import java.util.List;

public interface UserService {
    // Create a new user
    UserDto createUser(UserDto userDto);

    // Get all users
    List<UserDto> getAllUsers();
}
