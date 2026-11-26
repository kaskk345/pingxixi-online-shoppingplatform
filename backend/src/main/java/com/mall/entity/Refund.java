package com.mall.entity;

import com.mall.entity.enums.PaymentChannel;
import com.mall.entity.enums.RefundStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 退款单：售后产生的部分退款，关联原支付单，与「取消订单整单退款」区分。
 */
@Entity
@Table(name = "refund", indexes = {
        @Index(name = "idx_refund_after_sale", columnList = "afterSaleId"),
        @Index(name = "idx_refund_order", columnList = "orderId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String refundNo;

    @Column(nullable = false)
    private Long afterSaleId;

    @Column(nullable = false)
    private Long orderId;

    /** 原支付单号 */
    @Column(length = 40)
    private String paymentNo;

    /** 退款渠道，与原支付渠道一致 */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentChannel channel;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RefundStatus status;

    @Column(length = 255)
    private String remark;

    private LocalDateTime refundedAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        if (status == null) {
            status = RefundStatus.CREATED;
        }
        if (amount == null) {
            amount = BigDecimal.ZERO;
        }
    }
}
