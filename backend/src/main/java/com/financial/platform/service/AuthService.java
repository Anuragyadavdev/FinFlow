package com.financial.platform.service;

import com.financial.platform.dto.request.LoginRequest;
import com.financial.platform.dto.request.RegisterRequest;
import com.financial.platform.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);
}