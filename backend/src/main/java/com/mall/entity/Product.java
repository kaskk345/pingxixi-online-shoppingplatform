package com.mall.entity;

import com.mall.entity.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    /** 分类，如：数码 / 食品 / 服饰 / 家居 / 美妆 */
    @Column(length = 30)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /** 库存数量 */
    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 1;

    /** 累计销量 */
    @Column(nullable = false)
    @Builder.Default
    private Integer sales = 0;

    /** 平均评分（0-5） */
    @Builder.Default
    private Double rating = 5.0;

    /** 评价数量 */
    @Column(nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status;

    /** 乐观锁，用于库存扣减与冻结的并发控制 */
    @Version
    private Long version;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime soldAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = ProductStatus.ON_SALE;
        }
        if (stock == null) {
            stock = 1;
        }
        if (sales == null) {
            sales = 0;
        }
        if (rating == null) {
            rating = 5.0;
        }
        if (reviewCount == null) {
            reviewCount = 0;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
