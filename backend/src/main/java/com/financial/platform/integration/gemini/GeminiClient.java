package com.financial.platform.integration.gemini;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
public class GeminiClient {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.base-url}")
    private String baseUrl;

    @Value("${gemini.model}")
    private String model;

    @Value("${gemini.max-output-tokens:1024}")
    private int maxOutputTokens;

    @Value("${gemini.temperature:0.4}")
    private double temperature;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();
    public GeminiClient(WebClient.Builder webClientBuilder) {
    this.webClientBuilder = webClientBuilder;
}
    /**
     * Send a prompt to Gemini and return the text reply.
     * Returns null if the call fails or the key is not configured.
     */
    public String generate(String prompt) {
        if (apiKey == null || apiKey.isBlank() || "YOUR_API_KEY_HERE".equals(apiKey)) {
            log.warn("Gemini API key not configured — AI responses disabled");
            return null;
        }

        try {
            ObjectNode body = buildRequestBody(prompt);
            String url = baseUrl + "/models/" + model + ":generateContent?key=" + apiKey;

            String raw = webClientBuilder.build()
                    .post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(objectMapper.writeValueAsString(body))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return extractText(raw);

        } catch (Exception e) {
            log.error("Gemini call failed: {}", e.getMessage());
            return null;
        }
    }

    // ----------------------------------------------------------

    private ObjectNode buildRequestBody(String prompt) {
        ObjectNode root = objectMapper.createObjectNode();

        // contents[0].parts[0].text = prompt
        ArrayNode contents = root.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        ObjectNode part = parts.addObject();
        part.put("text", prompt);

        // generationConfig
        ObjectNode genConfig = root.putObject("generationConfig");
        genConfig.put("temperature", temperature);
        genConfig.put("maxOutputTokens", maxOutputTokens);
        genConfig.put("topP", 0.95);

        // safetySettings (relax for financial content)
        ArrayNode safety = root.putArray("safetySettings");
        addSafety(safety, "HARM_CATEGORY_HARASSMENT");
        addSafety(safety, "HARM_CATEGORY_HATE_SPEECH");
        addSafety(safety, "HARM_CATEGORY_SEXUALLY_EXPLICIT");
        addSafety(safety, "HARM_CATEGORY_DANGEROUS_CONTENT");

        return root;
    }

    private void addSafety(ArrayNode arr, String category) {
        ObjectNode s = arr.addObject();
        s.put("category", category);
        s.put("threshold", "BLOCK_ONLY_HIGH");
    }

    private String extractText(String raw) throws Exception {
        JsonNode root = objectMapper.readTree(raw);

        JsonNode candidates = root.path("candidates");
        if (candidates.isMissingNode() || candidates.isEmpty()) {
            log.warn("Gemini returned no candidates: {}", raw);
            return null;
        }

        JsonNode parts = candidates.get(0).path("content").path("parts");
        if (parts.isMissingNode() || parts.isEmpty()) return null;

        StringBuilder sb = new StringBuilder();
        for (JsonNode part : parts) {
            if (part.has("text")) sb.append(part.path("text").asText());
        }
        return sb.toString().trim();
    }
}