package com.bank.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleError(
            RuntimeException ex){

        Map<String,Object> error =
                new HashMap<>();

        error.put("message", ex.getMessage());
        error.put("status", 400);
        error.put("time", LocalDateTime.now());

        return new ResponseEntity<>(
                error,
                HttpStatus.BAD_REQUEST);
    }

}