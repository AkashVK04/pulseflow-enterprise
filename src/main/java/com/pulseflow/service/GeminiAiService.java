package com.pulseflow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiAiService {

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.6-flash}")
    private String modelAlias;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateContent(String prompt) {

        if (apiKey == null || apiKey.isBlank()) {
            return "Gemini API Key is not configured in application environment.";
        }

        String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                modelAlias,
                apiKey
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = Map.of(
                "text", prompt
        );

        Map<String, Object> contentsObj = Map.of(
                "parts", List.of(textPart)
        );

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(contentsObj)
        );

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, headers);

        try {

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(
                            url,
                            entity,
                            Map.class
                    );

            if (!response.getStatusCode().is2xxSuccessful()) {
                return "Gemini API request failed with status: "
                        + response.getStatusCode();
            }

            Map body = response.getBody();

            if (body == null) {
                return "Gemini returned an empty response.";
            }

            Object candidatesObject = body.get("candidates");

            if (!(candidatesObject instanceof List<?> candidates)
                    || candidates.isEmpty()) {
                return "Gemini returned no candidates.";
            }

            Object candidateObject = candidates.get(0);

            if (!(candidateObject instanceof Map<?, ?> candidate)) {
                return "Invalid Gemini candidate response.";
            }

            Object contentObject = candidate.get("content");

            if (!(contentObject instanceof Map<?, ?> content)) {
                return "Gemini response contains no content.";
            }

            Object partsObject = content.get("parts");

            if (!(partsObject instanceof List<?> parts)
                    || parts.isEmpty()) {
                return "Gemini response contains no text parts.";
            }

            Object firstPartObject = parts.get(0);

            if (!(firstPartObject instanceof Map<?, ?> firstPart)) {
                return "Invalid Gemini response part.";
            }

            Object textObject = firstPart.get("text");

            if (textObject instanceof String text && !text.isBlank()) {
                return text;
            }

            return "Gemini returned an empty text response.";

        } catch (Exception e) {

            return "Error calling Gemini API: "
                    + e.getMessage();
        }
    }
}