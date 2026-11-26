package com.mall.pay;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 支付相关配置。
 *
 * <p>默认全部走「模拟收银台」，不做任何外网调用；若配置了支付宝沙箱参数，
 * 可将 {@code mall.pay.alipay.enabled} 置为 true 走真实支付宝网关。</p>
 */
@Component
@ConfigurationProperties(prefix = "mall.pay")
@Getter
@Setter
public class PayProperties {

    private Alipay alipay = new Alipay();

    @Getter
    @Setter
    public static class Alipay {
        /** 是否启用支付宝真实网关（false 时回落为模拟收银台） */
        private boolean enabled = false;
        /** 沙箱 APPID */
        private String appId;
        /** 网关地址：沙箱 https://openapi-sandbox.dl.alipaydev.com/gateway.do */
        private String gatewayUrl = "https://openapi-sandbox.dl.alipaydev.com/gateway.do";
        /** 应用私钥（PKCS8，Base64，无需 PEM 头） */
        private String privateKey;
        /** 支付宝公钥（Base64，无需 PEM 头），用于回调验签 */
        private String alipayPublicKey;
        /** 异步通知地址：必须是公网可访问的 http(s) 地址 */
        private String notifyUrl;
        /** 同步跳转地址：支付完成后浏览器回跳的前端地址 */
        private String returnUrl;
        /** 商品标题前缀 */
        private String subjectPrefix = "拼嘻嘻订单";
    }
}
