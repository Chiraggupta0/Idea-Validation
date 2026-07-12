package com.sivp.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class AppConfig {

    @Value("${n8n.connect-timeout-ms}")
    private long connectTimeoutMs;

    @Value("${n8n.read-timeout-ms}")
    private long readTimeoutMs;

    /** RestTemplate with a long read timeout — the agent pipeline takes 30–90s. */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        factory.setReadTimeout(Duration.ofMillis(readTimeoutMs));
        return new RestTemplate(factory);
    }
}
