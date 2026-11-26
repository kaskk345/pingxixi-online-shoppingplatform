package com.mall.dto;

import java.time.LocalDateTime;

/**
 * 收货地址视图。
 */
public record AddressView(
        Long id,
        String receiverName,
        String receiverPhone,
        String region,
        String detail,
        String fullAddress,
        boolean isDefault,
        LocalDateTime createdAt
) {
}
