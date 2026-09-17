package com.financial.platform.dto.request;

import com.financial.platform.entity.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 100)
    private String name;

    @NotNull(message = "Category type is required")
    private Category.CategoryType type;

    @Size(max = 50)
    private String icon;

    @Size(max = 20)
    private String color;

    @Size(max = 500)
    private String description;
}