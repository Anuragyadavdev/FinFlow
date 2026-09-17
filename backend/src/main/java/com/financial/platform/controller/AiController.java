package com.financial.platform.controller;

import com.financial.platform.dto.request.ai.AiQuestionRequest;
import com.financial.platform.dto.response.ApiResponse;
import com.financial.platform.dto.response.ai.AiAnswerResponse;
import com.financial.platform.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/ask")
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<AiAnswerResponse>> ask(
            @Valid @RequestBody AiQuestionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                aiService.ask(request.getQuestion())));
    }

    @GetMapping("/samples")
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<List<String>>> samples() {
        return ResponseEntity.ok(ApiResponse.success(List.of(
                "Where did my money go this month?",
                "How much did I save this month?",
                "Compare this month with last month",
                "Any unusual transactions?",
                "Which category increased the most?",
                "How is Reliance performing?",
                "Give me a financial summary"
        )));
    }

    //adding
    @PostMapping("/advise")
    @PreAuthorize("hasAuthority('ANALYTICS_VIEW_OWN')")
    public ResponseEntity<ApiResponse<com.financial.platform.dto.response.ai.AdviceResponse>>
    advise(@Valid @RequestBody com.financial.platform.dto.request.ai.AdviceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiService.advise(request)));
    }
}