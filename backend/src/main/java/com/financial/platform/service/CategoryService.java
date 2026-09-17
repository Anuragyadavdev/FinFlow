package com.financial.platform.service;

import com.financial.platform.dto.request.CategoryRequest;
import com.financial.platform.dto.response.CategoryResponse;
import com.financial.platform.entity.Category;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAllCategories();

    List<CategoryResponse> getCategoriesByType(Category.CategoryType type);

    CategoryResponse getCategory(Long id);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);
}