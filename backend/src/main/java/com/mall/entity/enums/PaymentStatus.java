package com.mall.entity.enums;

/**
 * 支付单状态：
 * 已创建（待支付）-> 支付成功；失败 / 关闭为终态；
 * 已支付订单被取消后转为已退款。
 */
public enum PaymentStatus {
    CREATED("待支付"),
    SUCCESS("支付成功"),
    FAILED("支付失败"),
    CLOSED("已关闭"),
    REFUNDED("已退款");

    private final String label;

    PaymentStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
