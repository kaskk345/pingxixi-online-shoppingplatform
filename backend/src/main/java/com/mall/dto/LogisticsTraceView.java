package com.mall.dto;

import java.time.LocalDateTime;

/**
 * 物流轨迹节点视图。
 */
public record LogisticsTraceView(
        Long id,
        String status,
        String statusLabel,
        String description,
        String location,
        LocalDateTime occurredAt
) {
}
