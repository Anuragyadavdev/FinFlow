package com.financial.platform.service;

import com.financial.platform.dto.request.ai.AdviceRequest;
import com.financial.platform.dto.response.ai.AdviceResponse;
import com.financial.platform.dto.response.ai.AiAnswerResponse;

public interface AiService {
    AiAnswerResponse ask(String question);
    AdviceResponse advise(AdviceRequest request);
}

