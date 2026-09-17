package com.financial.platform.service.impl;

import com.financial.platform.dto.request.CategoryRequest;
import com.financial.platform.dto.response.CategoryResponse;
import com.financial.platform.entity.Category;
import com.financial.platform.entity.User;
import com.financial.platform.exception.BadRequestException;
import com.financial.platform.exception.ResourceNotFoundException;
import com.financial.platform.mapper.CategoryMapper;
import com.financial.platform.repository.CategoryRepository;
import com.financial.platform.service.CategoryService;
import com.financial.platform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        Long userId = SecurityUtils.getCurrentUserId();
        return categoryRepository.findAvailableForUser(userId)
                .stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(Category.CategoryType type) {
        Long userId = SecurityUtils.getCurrentUserId();
        return categoryRepository.findByUserIdAndTypeAndIsDeletedFalse(userId, type)
                .stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategory(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Category category = categoryRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        User user = SecurityUtils.getCurrentUser();

        if (categoryRepository.existsByUserIdAndNameAndTypeAndIsDeletedFalse(
                user.getId(), request.getName(), request.getType())) {
            throw new BadRequestException("Category with this name already exists");
        }

        Category category = categoryMapper.toEntity(request, user);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Category category = categoryRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        if (Boolean.TRUE.equals(category.getIsDefault())) {
            throw new BadRequestException("Cannot modify default categories");
        }

        categoryMapper.updateEntity(category, request);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Category category = categoryRepository
                .findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        if (Boolean.TRUE.equals(category.getIsDefault())) {
            throw new BadRequestException("Cannot delete default categories");
        }

        category.setIsDeleted(true);
        category.setIsActive(false);
        categoryRepository.save(category);
    }
}