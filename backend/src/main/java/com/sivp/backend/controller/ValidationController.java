package com.sivp.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.sivp.backend.dto.IdeaRequest;
import com.sivp.backend.service.N8nService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ValidationController {

    private final N8nService n8nService;

    public ValidationController(N8nService n8nService) {
        this.n8nService = n8nService;
    }

    /** Submit a startup idea → runs the 10-agent pipeline → returns the report. */
    @PostMapping("/validate")
    public ResponseEntity<JsonNode> validate(@RequestBody IdeaRequest idea) {
        return ResponseEntity.ok(n8nService.validate(idea));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ok");
    }
}
