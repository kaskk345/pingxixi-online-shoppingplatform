package com.mall.entity.enums;

/**
 * 售后诉求：客户提交申请时选择，代表「希望怎么处理」。
 * 与商家最终给出的 AfterSaleResult 分开存储。
 */
public enum AfterSaleType {
    RETURN_REFUND("退货退款"),
    REFUND_ONLY("仅退款"),
    EXCHANGE("换货"),
    REPAIR("维修");

    private final String label;

    AfterSaleType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
