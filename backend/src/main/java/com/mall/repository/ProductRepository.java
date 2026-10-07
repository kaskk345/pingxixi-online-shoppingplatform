package com.mall.repository;

import com.mall.entity.Product;
import com.mall.entity.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /** 当前唯一可购买的商品（在售 或 已恢复在售） */
    Optional<Product> findFirstByStatusIn(List<ProductStatus> statuses);

    boolean existsByStatusIn(List<ProductStatus> statuses);

    Optional<Product> findFirstByStatus(ProductStatus status);

    List<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status);

    List<Product> findAllByOrderByCreatedAtDesc();

    boolean existsByStatus(ProductStatus status);
}
