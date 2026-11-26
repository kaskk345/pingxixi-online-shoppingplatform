package com.mall.entity.enums;

/**
 * 退款单状态：售后产生的部分退款独立成单，与整单取消退款区分。
 */
public enum RefundStatus {
    CREATED("退款处理中"),
    SUCCESS("退款成功"),
    FAILED("退款失败");

    private final String label;

    RefundStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
