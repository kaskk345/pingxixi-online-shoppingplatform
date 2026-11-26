package com.mall.dto;

import java.time.LocalDateTime;

/**
 * 订单列表内嵌的运单摘要，避免买家为看运单再发一次请求。
 */
public record ShippingInfo(
        String expressCompany,
        String expressCompanyLabel,
        String trackingNo,
        String status,
        String statusLabel,
        LocalDateTime signedAt
) {
}
