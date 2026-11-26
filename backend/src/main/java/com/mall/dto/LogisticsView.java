package com.mall.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 物流详情视图：运单信息 + 轨迹时间线。
 */
public record LogisticsView(
        Long orderId,
        String orderNo,
        String receiverName,
        String receiverPhone,
        String address,
        String expressCompany,
        String expressCompanyLabel,
        String trackingNo,
        String status,
        String statusLabel,
        LocalDateTime shippedAt,
        LocalDateTime signedAt,
        List<LogisticsTraceView> traces
) {
}
