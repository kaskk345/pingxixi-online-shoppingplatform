package com.mall.entity;

import com.mall.entity.enums.PaymentChannel;
import com.mall.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付单：一次订单支付对应一条记录。
 * 订单与支付单 1:N（可重试换渠道），同一时刻只有一条处于待支付。
 */
@Entity
@Table(name = "payment", indexes = {
        @Index(name = "idx_payment_order", columnList = "orderId"),
        @Index(name = "idx_payment_no", columnList = "paymentNo")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 支付流水号：对外展示、回调时作为 out_trade_no */
    @Column(nullable = false, unique = true, length = 40)
    private String paymentNo;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false, length = 32)
    private String orderNo;

    @Column(nullable = false)
    private Long customerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentChannel channel;

    /** 支付金额（取自订单金额快照） */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    /** 第三方交易号（支付宝 trade_no / 微信 transaction_id / 银行流水号） */
    @Column(length = 64)
    private String tradeNo;

    /** 支付网关下发的跳转地址：模拟渠道为站内收银台，支付宝为网关 URL */
    @Column(length = 512)
    private String payUrl;

    /** 是否走模拟渠道（演示/无第三方资质时） */
    @Column(nullable = false)
    @Builder.Default
    private Boolean mock = true;

    @Column(length = 255)
    private String failReason;

    private LocalDateTime paidAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = PaymentStatus.CREATED;
        }
        if (mock == null) {
            mock = true;
        }
        if (amount == null) {
            amount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
