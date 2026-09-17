package com.financial.platform.service;

import com.financial.platform.dto.request.ChangePasswordRequest;
import com.financial.platform.dto.request.UpdateUserRequest;
import com.financial.platform.dto.response.UserResponse;
import org.springframework.data.domain.Page;

public interface UserService {
    UserResponse getProfile();
    UserResponse updateProfile(UpdateUserRequest request);
    void changePassword(ChangePasswordRequest request);
    Page<UserResponse> listUsers(int page, int size);
    void deactivateUser(Long id);
}