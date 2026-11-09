package com.mall.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单视图：买卖两端共用，附带各节点时间与可取消标记。
 */
public record OrderView(
        Long id,
        String orderNo,
        Long customerId,
        String buyerName,
        String buyerPhone,
        String address,
        String remark,
        BigDecimal totalAmount,
        Integer itemCount,
        String status,
        String statusLabel,
        String canceledBy,
        String cancelReason,
        List<OrderItemView> items,
        LocalDateTime createdAt,
        LocalDateTime confirmedAt,
        LocalDateTime preparedAt,
        LocalDateTime shippedAt,
        LocalDateTime completedAt,
        LocalDateTime canceledAt,
        boolean cancellableByCustomer,
        boolean cancellableBySeller
) {
}
