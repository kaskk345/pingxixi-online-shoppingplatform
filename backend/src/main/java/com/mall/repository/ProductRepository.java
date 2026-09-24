package com.mall.repository;

import com.mall.entity.Product;
import com.mall.entity.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findFirstByStatus(ProductStatus status);

    List<Product> findAllByOrderByCreatedAtDesc();

    boolean existsByStatus(ProductStatus status);
}
