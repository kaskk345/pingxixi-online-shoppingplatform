package com.mall.pay;

import com.mall.common.BizException;
import com.mall.entity.Payment;
import com.mall.entity.enums.PaymentChannel;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 支付宝网关适配器（电脑网站支付 alipay.trade.page.pay）。
 *
 * <p>直接使用 JDK 自带 {@code SHA256withRSA} 完成 RSA2 签名，不引入 alipay-sdk 依赖，
 * 因此只要在 application.yml 里填好沙箱 APPID / 应用私钥 / 支付宝公钥即可对接真实沙箱。</p>
 *
 * <p>注意：沙箱的 notify_url 必须是公网可访问地址，本机演示时可用内网穿透。</p>
 */
@Component
@Order(10)
@RequiredArgsConstructor
public class AlipayGateway implements PaymentGateway {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final PayProperties props;

    @Override
    public boolean supports(PaymentChannel channel) {
        return channel == PaymentChannel.ALIPAY && props.getAlipay().isEnabled();
    }

    @Override
    public PaymentInit create(Payment payment) {
        PayProperties.Alipay cfg = props.getAlipay();
        if (isBlank(cfg.getAppId()) || isBlank(cfg.getPrivateKey())) {
            throw new BizException("支付宝支付未配置：请填写 mall.pay.alipay.app-id 与 private-key");
        }

        Map<String, String> params = new LinkedHashMap<>();
        params.put("app_id", cfg.getAppId());
        params.put("method", "alipay.trade.page.pay");
        params.put("format", "JSON");
        params.put("charset", "utf-8");
        params.put("sign_type", "RSA2");
        params.put("timestamp", LocalDateTime.now().format(TS));
        params.put("version", "1.0");
        params.put("notify_url", cfg.getNotifyUrl());
        params.put("return_url", cfg.getReturnUrl());
        params.put("biz_content", bizContent(payment, cfg.getSubjectPrefix()));

        String sign = sign(params, cfg.getPrivateKey());
        String query = params.entrySet().stream()
                .filter(e -> !isBlank(e.getValue()))
                .map(e -> e.getKey() + "=" + enc(e.getValue()))
                .collect(Collectors.joining("&"))
                + "&sign=" + enc(sign);
        return new PaymentInit(cfg.getGatewayUrl() + "?" + query, false, "支付宝沙箱");
    }

    @Override
    public boolean verifyNotify(Map<String, String> params) {
        String publicKey = props.getAlipay().getAlipayPublicKey();
        String sign = params.get("sign");
        if (isBlank(publicKey) || isBlank(sign)) {
            // 未配置公钥时不做验签，仅用于本地联调
            return true;
        }
        try {
            String content = params.entrySet().stream()
                    .filter(e -> !"sign".equals(e.getKey()) && !"sign_type".equals(e.getKey()))
                    .filter(e -> !isBlank(e.getValue()))
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining("&"));
            Signature verifier = Signature.getInstance("SHA256withRSA");
            verifier.initVerify(publicKey(publicKey));
            verifier.update(content.getBytes(StandardCharsets.UTF_8));
            return verifier.verify(Base64.getDecoder().decode(sign));
        } catch (Exception e) {
            return false;
        }
    }

    private String bizContent(Payment payment, String subjectPrefix) {
        // 手写 JSON，避免为几个字段引入额外序列化依赖
        return "{"
                + "\"out_trade_no\":\"" + payment.getPaymentNo() + "\","
                + "\"total_amount\":\"" + payment.getAmount().toPlainString() + "\","
                + "\"subject\":\"" + escape(subjectPrefix + "-" + payment.getOrderNo()) + "\","
                + "\"product_code\":\"FAST_INSTANT_TRADE_PAY\""
                + "}";
    }

    private String sign(Map<String, String> params, String privateKey) {
        try {
            String content = params.entrySet().stream()
                    .filter(e -> !isBlank(e.getValue()))
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining("&"));
            Signature signer = Signature.getInstance("SHA256withRSA");
            signer.initSign(privateKey(privateKey));
            signer.update(content.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(signer.sign());
        } catch (Exception e) {
            throw new BizException("支付宝签名失败，请检查应用私钥格式（PKCS8 / Base64）");
        }
    }

    private PrivateKey privateKey(String raw) throws Exception {
        byte[] der = Base64.getDecoder().decode(clean(raw));
        return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(der));
    }

    private PublicKey publicKey(String raw) throws Exception {
        byte[] der = Base64.getDecoder().decode(clean(raw));
        return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(der));
    }

    private String clean(String key) {
        return key.replaceAll("-----[A-Z ]+-----", "").replaceAll("\\s", "");
    }

    private String enc(String v) {
        return URLEncoder.encode(v, StandardCharsets.UTF_8);
    }

    private String escape(String v) {
        return v == null ? "" : v.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private boolean isBlank(String v) {
        return v == null || v.isBlank();
    }
}
