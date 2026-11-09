package com.mall.dto;

import java.math.BigDecimal;

/**
 * 订单明细视图。
 */
public record OrderItemView(
        Long id,
        Long productId,
        String productName,
        String productImage,
        BigDecimal price,
        Integer quantity,
        BigDecimal subtotal
) {
}
