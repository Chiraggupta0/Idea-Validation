package com.sivp.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.sivp.backend.dto.IdeaRequest;
import org.springframework.beans.factory.annotation.Value;
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
        return restTemplate.postForObject(webhookUrl, idea, JsonNode.class);
    }
}
