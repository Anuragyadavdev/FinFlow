package com.financial.platform.repository;

import com.financial.platform.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    List<Notification> findByUserIdAndIsReadFalseAndIsDeletedFalse(Long userId);

    Optional<Notification> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    long countByUserIdAndIsReadFalseAndIsDeletedFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP " +
           "WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") Long userId);
}