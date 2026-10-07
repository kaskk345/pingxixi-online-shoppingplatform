package com.mall.dto;

import java.time.LocalDateTime;

/**
 * 购买意向视图。
 * 卖家端 code 恒为 null（需求要求卖家侧不展示口令码、不与口令码挂钩）。
 */
public record IntentView(
        Long id,
        Long productId,
        String productName,
        String code,
        String buyerName,
        String buyerPhone,
        String buyerNote,
        LocalDateTime queueTime,
        LocalDateTime createdAt,
        String status,
        String statusLabel,
        String result,
        String resultLabel,
        Integer position,
        Integer aheadCount,
        boolean canModify,
        boolean codeActive
) {
}
