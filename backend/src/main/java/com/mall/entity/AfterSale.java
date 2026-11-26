package com.mall.entity;

import com.mall.entity.enums.AfterSaleResult;
import com.mall.entity.enums.AfterSaleStatus;
import com.mall.entity.enums.AfterSaleType;
import com.mall.entity.enums.ExpressCompany;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 售后单（挑战 C.3）：以「订单项」为粒度，独立状态机，不改变订单状态。
 */
@Entity
@Table(name = "after_sale", indexes = {
        @Index(name = "idx_after_sale_customer", columnList = "customerId"),
        @Index(name = "idx_after_sale_order", columnList = "orderId"),
        @Index(name = "idx_after_sale_item", columnList = "orderItemId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AfterSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String afterSaleNo;

    @Column(nullable = false)
    private Long orderId;

    /** 订单号快照，列表展示无需联表 */
    @Column(nullable = false, length = 32)
    private String orderNo;

    @Column(nullable = false)
    private Long orderItemId;

    @Column(nullable = false)
    private Long customerId;

    private Long productId;

    @Column(nullable = false, length = 100)
    private String productName;

    @Column(length = 500)
    private String productImage;

    /** 订单项金额（退款上限参考） */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal itemAmount;

    /** 订单项数量，退款成功后回滚库存用 */
    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AfterSaleType type;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** 凭证图片，逗号分隔的 URL */
    @Column(columnDefinition = "TEXT")
    private String images;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AfterSaleStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AfterSaleResult result;

    @Column(precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(length = 500)
    private String sellerReply;

    /** 退货物流：复用 C.2 的快递公司字典与运单号 */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ExpressCompany returnExpressCompany;

    @Column(length = 40)
    private String returnTrackingNo;

    private LocalDateTime returnShippedAt;

    private LocalDateTime appliedAt;
    private LocalDateTime handledAt;
    private LocalDateTime completedAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (appliedAt == null) {
            appliedAt = now;
        }
        if (status == null) {
            status = AfterSaleStatus.PENDING;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
