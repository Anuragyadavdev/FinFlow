package com.financial.platform.service.impl;

import com.financial.platform.dto.request.ChangePasswordRequest;
import com.financial.platform.dto.request.UpdateUserRequest;
import com.financial.platform.dto.response.UserResponse;
import com.financial.platform.entity.User;
import com.financial.platform.exception.BadRequestException;
import com.financial.platform.exception.ResourceNotFoundException;
import com.financial.platform.mapper.UserMapper;
import com.financial.platform.repository.UserRepository;
import com.financial.platform.service.UserService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile() {
        return userMapper.toResponse(SecurityUtils.getCurrentUser());
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UpdateUserRequest request) {
        User user = SecurityUtils.getCurrentUser();
        userMapper.updateEntity(user, request);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = SecurityUtils.getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> listUsers(int page, int size) {
        return userRepository.findAllActive(
                PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(userMapper::toResponse);
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setIsActive(false);
        userRepository.save(user);
    }
}