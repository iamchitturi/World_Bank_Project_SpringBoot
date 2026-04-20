package com.bank.exception;

import java.time.LocalDateTime;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<Object> handleAlreadyExists(
            ResourceAlreadyExistsException ex) {
        Map<String,Object> response = new HashMap<>();
        response.put("message", ex.getMessage());
        response.put("status", 400);
        response.put("time", LocalDateTime.now());

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

}