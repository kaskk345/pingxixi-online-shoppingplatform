package com.mall.entity.enums;

/**
 * 商品状态机：在售 -> 冻结 -> 已售出 / 在售；在售 -> 已下架。
 */
public enum ProductStatus {
    ON_SALE("在售"),
    FROZEN("冻结"),
    SOLD("已售出"),
    OFF_SHELF("已下架");

    private final String label;

    ProductStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
