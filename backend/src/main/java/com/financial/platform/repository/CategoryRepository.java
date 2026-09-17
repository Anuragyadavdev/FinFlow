package com.financial.platform.repository;

import com.financial.platform.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.isDeleted = false AND " +
           "(c.user.id = :userId OR c.user IS NULL) " +
           "ORDER BY c.isDefault DESC, c.name ASC")
    List<Category> findAvailableForUser(@Param("userId") Long userId);

    List<Category> findByUserIdAndIsDeletedFalse(Long userId);

    List<Category> findByUserIdAndTypeAndIsDeletedFalse(Long userId, Category.CategoryType type);

    Optional<Category> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    @Query("SELECT c FROM Category c WHERE c.isDefault = true AND c.isDeleted = false")
    List<Category> findDefaultCategories();

    boolean existsByUserIdAndNameAndTypeAndIsDeletedFalse(
        Long userId, String name, Category.CategoryType type
    );
}