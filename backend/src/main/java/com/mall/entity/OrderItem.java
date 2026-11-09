package com.mall.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * 订单明细：商品名称、图片、单价均为下单时快照，避免卖家改价影响历史订单。
 */
@Entity
@Table(name = "order_item", indexes = {
        @Index(name = "idx_order_item_order", columnList = "orderId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    private Long productId;

    @Column(nullable = false, length = 100)
    private String productName;

    @Column(length = 500)
    private String productImage;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
}
