package com.mall.entity.enums;

/**
 * 线上支付渠道（挑战 C.1）：
 * 银行卡 / 信用卡为银联卡类支付，支付宝 / 微信支付为第三方支付。
 */
public enum PaymentChannel {
    ALIPAY("支付宝"),
    WECHAT("微信支付"),
    BANK_CARD("银行卡"),
    CREDIT_CARD("信用卡");

    private final String label;

    PaymentChannel(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
