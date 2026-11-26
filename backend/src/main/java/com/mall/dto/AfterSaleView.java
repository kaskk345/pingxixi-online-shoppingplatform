package com.mall.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 售后单视图：买卖两端共用，附带协商记录与退款信息。
 */
public record AfterSaleView(
        Long id,
        String afterSaleNo,
        Long orderId,
        String orderNo,
        Long orderItemId,
        String productName,
        String productImage,
        BigDecimal itemAmount,
        Integer quantity,
        String type,
        String typeLabel,
        String title,
        String description,
        List<String> images,
        String status,
        String statusLabel,
        String result,
        String resultLabel,
        BigDecimal refundAmount,
        String sellerReply,
        String returnExpressCompany,
        String returnExpressCompanyLabel,
        String returnTrackingNo,
        LocalDateTime returnShippedAt,
        LocalDateTime appliedAt,
        LocalDateTime handledAt,
        LocalDateTime completedAt,
        List<AfterSaleLogView> logs,
        RefundView refund,
        boolean cancellable,
        boolean canShipBack,
        boolean canReceive
) {
}
