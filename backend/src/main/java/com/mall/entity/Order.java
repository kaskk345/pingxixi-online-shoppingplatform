package com.mall.entity;

import com.mall.entity.enums.ExpressCompany;
import com.mall.entity.enums.LogisticsStatus;
import com.mall.entity.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单主表：一次下单对应一个订单，可包含多件商品（购物车多选下单）。
 */
@Entity
@Table(name = "mall_order", indexes = {
        @Index(name = "idx_order_customer", columnList = "customerId"),
        @Index(name = "idx_order_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 订单号：展示给买卖双方的单据编号 */
    @Column(nullable = false, unique = true, length = 32)
    private String orderNo;

    /** 下单客户 */
    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false, length = 50)
    private String buyerName;

    @Column(nullable = false, length = 20)
    private String buyerPhone;

    /** 收货 / 交易地点（下单时的地址快照，地址簿后续修改不影响历史订单） */
    @Column(length = 255)
    private String address;

    /** 下单时选中的地址簿 ID，手输地址时为 null */
    private Long addressId;

    /** 买家留言 */
    @Column(length = 255)
    private String remark;

    /** 订单总金额（下单时价格快照求和） */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    /** 商品件数合计 */
    @Column(nullable = false)
    private Integer itemCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    /** 取消方：CUSTOMER / SELLER（未取消为 null） */
    @Column(length = 20)
    private String canceledBy;

    @Column(length = 255)
    private String cancelReason;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /** 支付渠道：ALIPAY / WECHAT / BANK_CARD / CREDIT_CARD（未支付为 null） */
    @Column(length = 20)
    private String payChannel;

    /** 快递公司：发货时由卖家选择（挑战 C.2） */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ExpressCompany expressCompany;

    /** 运单号：卖家填写，留空时由系统生成模拟单号 */
    @Column(length = 40)
    private String trackingNo;

    /** 物流状态：系统维护，买家只读 */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private LogisticsStatus logisticsStatus;

    /** 以下为各状态流转时间，便于追溯 */
    private LocalDateTime paidAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime preparedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime signedAt;
    private LocalDateTime completedAt;
    private LocalDateTime canceledAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = OrderStatus.PLACED;
        }
        if (itemCount == null) {
            itemCount = 0;
        }
        if (totalAmount == null) {
            totalAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
