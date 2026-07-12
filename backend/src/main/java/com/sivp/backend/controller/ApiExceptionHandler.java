package com.sivp.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    /** n8n unreachable, timed out, or errored — return a clean 502 instead of a stack trace. */
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<Map<String, String>> handleN8n(RestClientException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                "error", "Validation engine unavailable. Make sure n8n is running and the NEXUS workflow is Active.",
                "detail", ex.getMessage() == null ? "" : ex.getMessage()
        ));
    }
}
