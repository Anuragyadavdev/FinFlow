package com.financial.platform.dto.request.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiQuestionRequest {

    @NotBlank(message = "Question is required")
    @Size(min = 3, max = 500, message = "Question must be 3-500 characters")
    private String question;

    /** Optional: conversation id for multi-turn (not used in v1) */
    private String conversationId;
}