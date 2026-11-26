package com.mall.pay;

/**
 * 支付单初始化结果：网关下发的跳转地址 + 是否为模拟渠道。
 */
public record PaymentInit(String payUrl, boolean mock, String gatewayName) {
}
