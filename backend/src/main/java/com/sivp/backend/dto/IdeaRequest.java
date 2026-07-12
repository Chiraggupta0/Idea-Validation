package com.sivp.backend.dto;

/** The 7-field startup idea (Module 2 — Idea Submission). */
public record IdeaRequest(
        String startupName,
        String industry,
        String problemStatement,
        String solution,
        String targetAudience,
        String geographicMarket,
        String description
) {
}
