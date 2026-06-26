package com.example.fleet.exception;

public class BusinessConstraintViolationException extends RuntimeException {
    public BusinessConstraintViolationException(String message) {
        super(message);
    }
}
