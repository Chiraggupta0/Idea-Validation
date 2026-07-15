package com.sivp.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.sivp.backend.dto.IdeaRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/** Forwards a submitted idea to the n8n NEXUS webhook and returns the report JSON. */
@Service
public class N8nService {

    private final RestTemplate restTemplate;

    @Value("${n8n.webhook.url}")
    private String webhookUrl;

    public N8nService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public JsonNode validate(IdeaRequest idea) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Bypass ngrok's free-tier browser-warning interstitial when tunnelling n8n.
        headers.set("ngrok-skip-browser-warning", "true");
        HttpEntity<IdeaRequest> entity = new HttpEntity<>(idea, headers);
        return restTemplate.postForObject(webhookUrl, entity, JsonNode.class);
    }
}
