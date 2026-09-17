package com.financial.platform.mapper;

import com.financial.platform.dto.request.CategoryRequest;
import com.financial.platform.dto.response.CategoryResponse;
import com.financial.platform.entity.Category;
import com.financial.platform.entity.User;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        if (category == null) return null;

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .color(category.getColor())
                .isDefault(category.getIsDefault())
                .isActive(category.getIsActive())
                .description(category.getDescription())
                .build();
    }

    public Category toEntity(CategoryRequest request, User user) {
        return Category.builder()
                .user(user)
                .name(request.getName())
                .type(request.getType())
                .icon(request.getIcon())
                .color(request.getColor())
                .description(request.getDescription())
                .isDefault(false)
                .isActive(true)
                .build();
    }

    public void updateEntity(Category category, CategoryRequest request) {
        category.setName(request.getName());
        category.setType(request.getType());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setDescription(request.getDescription());
    }
}