package com.mall.pay;

import com.mall.entity.Payment;
import com.mall.entity.enums.PaymentChannel;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * 模拟支付网关（默认实现）：
 * 所有渠道都可以先落到站内收银台 /pay/{paymentNo}，由买家点击「确认支付」完成扣款。
 * 这样无第三方支付资质、无公网回调地址也能完整演示 C.1 的支付流程。
 */
@Component
@Order(100)
public class MockPaymentGateway implements PaymentGateway {

    @Override
    public boolean supports(PaymentChannel channel) {
        return true;
    }

    @Override
    public PaymentInit create(Payment payment) {
        return new PaymentInit("/pay/" + payment.getPaymentNo(), true, "模拟收银台");
    }
}
