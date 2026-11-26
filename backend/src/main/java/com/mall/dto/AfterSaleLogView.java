package com.mall.dto;

import java.time.LocalDateTime;

/**
 * 售后协商记录视图。
 */
public record AfterSaleLogView(
        Long id,
        String role,
        String content,
        LocalDateTime createdAt
) {
}
