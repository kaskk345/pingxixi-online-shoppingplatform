package com.mall.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 退款单视图。
 */
public record RefundView(
        String refundNo,
        BigDecimal amount,
        String status,
        String statusLabel,
        String channel,
        String channelLabel,
        LocalDateTime refundedAt
) {
}
