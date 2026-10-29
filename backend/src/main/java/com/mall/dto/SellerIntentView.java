package com.mall.dto;

import java.time.LocalDateTime;

/**
 * 卖家端：以商品为主体的交易历史条目。
 * 同时覆盖注册客户（customerId + customerUsername）与匿名买家（customerId 为 null）。
 */
public record SellerIntentView(
        Long id,
        Long productId,
        String buyerName,
        String buyerPhone,
        Long customerId,
        String customerUsername,
        String status,
        String statusLabel,
        String result,
        String resultLabel,
        LocalDateTime queueTime,
        LocalDateTime createdAt
) {
}
