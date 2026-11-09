package com.mall.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 收藏条目视图：附带商品当前价格、库存与可购买状态。
 */
public record FavoriteView(
        Long id,
        Long productId,
        String name,
        String image,
        BigDecimal price,
        Integer stock,
        String status,
        boolean available,
        LocalDateTime createdAt
) {
}
