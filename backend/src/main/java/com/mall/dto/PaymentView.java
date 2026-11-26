package com.mall.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付单视图：收银台与订单详情共用。
 */
public record PaymentView(
        Long id,
        String paymentNo,
        Long orderId,
        String orderNo,
        String channel,
        String channelLabel,
        BigDecimal amount,
        String status,
        String statusLabel,
        String tradeNo,
        String payUrl,
        boolean mock,
        String failReason,
        LocalDateTime paidAt,
        LocalDateTime createdAt
) {
}
