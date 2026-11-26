package com.mall.pay;

import com.mall.entity.Payment;
import com.mall.entity.enums.PaymentChannel;

import java.util.Map;

/**
 * 支付网关适配器：把「支付单」翻译成具体渠道的跳转地址。
 *
 * <p>新增渠道只需实现本接口并注册为 Spring Bean，无需改动订单与支付主流程。</p>
 */
public interface PaymentGateway {

    /** 是否接管该渠道（同一渠道可存在多个实现，按 @Order 优先级取第一个） */
    boolean supports(PaymentChannel channel);

    /** 创建支付并返回跳转地址 */
    PaymentInit create(Payment payment);

    /** 校验异步通知签名；模拟渠道无需校验 */
    default boolean verifyNotify(Map<String, String> params) {
        return true;
    }
}
