package com.mall.repository;

import com.mall.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Favorite> findByCustomerIdAndProductId(Long customerId, Long productId);

    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    long countByCustomerId(Long customerId);

    void deleteByCustomerIdAndProductId(Long customerId, Long productId);
}
