package com.mall.repository;

import com.mall.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<CartItem> findByCustomerIdAndProductId(Long customerId, Long productId);

    Optional<CartItem> findByIdAndCustomerId(Long id, Long customerId);

    List<CartItem> findByIdInAndCustomerId(List<Long> ids, Long customerId);

    long countByCustomerId(Long customerId);

    void deleteByCustomerIdAndProductId(Long customerId, Long productId);
}
