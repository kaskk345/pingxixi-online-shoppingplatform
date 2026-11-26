package com.mall.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单视图：买卖两端共用，附带各节点时间、支付信息与可操作标记。
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
        LocalDateTime paidAt,
        String payChannel,
        LocalDateTime confirmedAt,
        LocalDateTime preparedAt,
        LocalDateTime shippedAt,
        LocalDateTime completedAt,
        LocalDateTime canceledAt,
        ShippingInfo shipping,
        boolean payable,
        boolean cancellableByCustomer,
        boolean cancellableBySeller
) {
}
