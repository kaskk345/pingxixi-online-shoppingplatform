package com.mall.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 售后协商记录：对应「商家收到申请后线下与客户协商」的系统留痕。
 * role 取值：CUSTOMER / SELLER / SYSTEM。
 */
@Entity
@Table(name = "after_sale_log", indexes = {
        @Index(name = "idx_after_sale_log", columnList = "afterSaleId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AfterSaleLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long afterSaleId;

    @Column(nullable = false, length = 20)
    private String role;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
