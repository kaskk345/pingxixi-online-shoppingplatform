package com.mall.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 收货地址（挑战 C.2）：一个客户可维护多个地址，其中最多一个为默认地址。
 */
@Entity
@Table(name = "address", indexes = {
        @Index(name = "idx_address_customer", columnList = "customerId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false, length = 50)
    private String receiverName;

    @Column(nullable = false, length = 20)
    private String receiverPhone;

    /** 地区，如「上海市普陀区」 */
    @Column(length = 100)
    private String region;

    /** 详细地址，如「中山北路3663号 华东师范大学」 */
    @Column(nullable = false, length = 255)
    private String detail;

    /** 是否默认地址：同一客户至多一条为 true，由 Service 层事务保证 */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /** 拼接成完整地址，用于写入订单快照 */
    public String fullAddress() {
        String r = region == null ? "" : region.trim();
        String d = detail == null ? "" : detail.trim();
        return r + d;
    }

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (isDefault == null) {
            isDefault = false;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
