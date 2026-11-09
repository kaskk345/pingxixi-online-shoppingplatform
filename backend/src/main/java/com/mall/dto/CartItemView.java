package com.mall.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 购物车条目视图：价格与库存取商品当前值，available 表示能否下单。
 */
public record CartItemView(
        Long id,
        Long productId,
        String name,
        String image,
        BigDecimal price,
        Integer quantity,
        BigDecimal subtotal,
        Integer stock,
        String status,
        boolean available,
        LocalDateTime createdAt
) {
}
