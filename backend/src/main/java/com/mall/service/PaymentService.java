package com.mall.service;

import com.mall.common.BizException;
import com.mall.dto.PaymentView;
import com.mall.entity.Order;
import com.mall.entity.Payment;
import com.mall.entity.enums.OrderStatus;
import com.mall.entity.enums.PaymentChannel;
import com.mall.entity.enums.PaymentStatus;
import com.mall.pay.PaymentGateway;
import com.mall.pay.PaymentInit;
import com.mall.repository.OrderRepository;
import com.mall.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 支付服务（挑战 C.1）：
 * 1. 创建支付单：订单 PLACED -> PENDING_PAY，并生成渠道跳转地址；
 * 2. 支付成功：支付单 SUCCESS，订单 PENDING_PAY -> PAID；
 * 3. 订单取消：已支付的支付单置为 REFUNDED，未支付的置为 CLOSED。
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final DateTimeFormatter NO_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final List<PaymentGateway> gateways;

    /** 创建支付单并发起支付（同一订单重复发起时，旧支付单自动关闭） */
    @Transactional
    public PaymentView create(Long customerId, Long orderId, PaymentChannel channel) {
        if (channel == null) {
            throw new BizException("请选择支付方式");
        }
        Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new BizException("订单不存在"));
        if (order.getStatus() == OrderStatus.PAID) {
            throw new BizException("订单已支付，请勿重复支付");
        }
        if (!order.getStatus().payable()) {
            throw new BizException("当前订单状态（" + order.getStatus().getLabel() + "）不可支付");
        }

        paymentRepository.findByOrderIdAndStatus(orderId, PaymentStatus.CREATED).forEach(old -> {
            old.setStatus(PaymentStatus.CLOSED);
            old.setFailReason("重新发起支付，原支付单关闭");
            paymentRepository.save(old);
        });

        Payment payment = Payment.builder()
                .paymentNo(generatePaymentNo())
                .orderId(order.getId())
                .orderNo(order.getOrderNo())
                .customerId(customerId)
                .channel(channel)
                .amount(order.getTotalAmount())
                .status(PaymentStatus.CREATED)
                .build();

        PaymentInit init = resolve(channel).create(payment);
        payment.setPayUrl(init.payUrl());
        payment.setMock(init.mock());
        paymentRepository.save(payment);

        if (order.getStatus() == OrderStatus.PLACED) {
            order.setStatus(OrderStatus.PENDING_PAY);
            orderRepository.save(order);
        }
        return toView(payment);
    }

    /** 模拟渠道确认支付（真实渠道由第三方异步通知触发） */
    @Transactional
    public PaymentView confirmMock(Long customerId, String paymentNo) {
        Payment payment = mustGet(paymentNo);
        if (!payment.getCustomerId().equals(customerId)) {
            throw new BizException("无权操作该支付单");
        }
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return toView(payment);
        }
        if (payment.getStatus() != PaymentStatus.CREATED) {
            throw new BizException("支付单状态为「" + payment.getStatus().getLabel() + "」，无法支付");
        }
        if (Boolean.FALSE.equals(payment.getMock())) {
            throw new BizException("该支付单需在第三方支付页面完成付款");
        }
        return toView(markSuccess(payment, "MOCK" + payment.getPaymentNo()));
    }

    /** 模拟渠道支付失败 */
    @Transactional
    public PaymentView failMock(Long customerId, String paymentNo, String reason) {
        Payment payment = mustGet(paymentNo);
        if (!payment.getCustomerId().equals(customerId)) {
            throw new BizException("无权操作该支付单");
        }
        if (payment.getStatus() != PaymentStatus.CREATED) {
            throw new BizException("当前支付单状态不可标记失败");
        }
        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailReason(reason == null || reason.isBlank() ? "买家放弃支付" : reason);
        paymentRepository.save(payment);
        // 订单回到「客户下单」，允许买家重新发起支付
        Order order = orderRepository.findById(payment.getOrderId()).orElse(null);
        if (order != null && order.getStatus() == OrderStatus.PENDING_PAY) {
            order.setStatus(OrderStatus.PLACED);
            orderRepository.save(order);
        }
        return toView(payment);
    }

    /** 支付宝异步通知：验签 + 幂等更新 */
    @Transactional
    public String handleAlipayNotify(Map<String, String> params) {
        String paymentNo = params.get("out_trade_no");
        String tradeStatus = params.get("trade_status");
        if (paymentNo == null || tradeStatus == null) {
            return "failure";
        }
        Payment payment = paymentRepository.findByPaymentNo(paymentNo).orElse(null);
        if (payment == null) {
            return "failure";
        }
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return "success";
        }
        PaymentGateway gateway = gateways.stream()
                .filter(g -> g.supports(PaymentChannel.ALIPAY))
                .findFirst()
                .orElse(null);
        if (gateway != null && !gateway.verifyNotify(params)) {
            return "failure";
        }
        if (!"TRADE_SUCCESS".equals(tradeStatus) && !"TRADE_FINISHED".equals(tradeStatus)) {
            return "success";
        }
        BigDecimal paid = parseAmount(params.get("total_amount"));
        if (paid != null && payment.getAmount() != null && paid.compareTo(payment.getAmount()) != 0) {
            return "failure";
        }
        markSuccess(payment, params.get("trade_no"));
        return "success";
    }

    /** 订单取消时同步处理支付单：已支付原路退款，未支付直接关闭 */
    @Transactional
    public void refundByCancel(Long orderId) {
        for (Payment payment : paymentRepository.findByOrderIdOrderByIdDesc(orderId)) {
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                payment.setStatus(PaymentStatus.REFUNDED);
                payment.setFailReason("订单已取消，支付金额原路退回");
                paymentRepository.save(payment);
            } else if (payment.getStatus() == PaymentStatus.CREATED) {
                payment.setStatus(PaymentStatus.CLOSED);
                payment.setFailReason("订单已取消，支付单关闭");
                paymentRepository.save(payment);
            }
        }
    }

    public PaymentView getForCustomer(Long customerId, String paymentNo) {
        Payment payment = mustGet(paymentNo);
        if (!payment.getCustomerId().equals(customerId)) {
            throw new BizException("无权查看该支付单");
        }
        return toView(payment);
    }

    public List<PaymentView> listByOrder(Long customerId, Long orderId) {
        orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new BizException("订单不存在"));
        return paymentRepository.findByOrderIdOrderByIdDesc(orderId).stream().map(this::toView).toList();
    }

    /** 卖家端查看某订单的支付记录 */
    public List<PaymentView> listByOrderForSeller(Long orderId) {
        return paymentRepository.findByOrderIdOrderByIdDesc(orderId).stream().map(this::toView).toList();
    }

    // ===== 内部方法 =====

    private Payment markSuccess(Payment payment, String tradeNo) {
        LocalDateTime now = LocalDateTime.now();
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setTradeNo(tradeNo);
        payment.setPaidAt(now);
        payment.setFailReason(null);
        paymentRepository.save(payment);

        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new BizException("订单不存在"));
        if (order.getStatus() == OrderStatus.CANCELED) {
            // 极端情况：订单已取消后才回调成功，直接退款
            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setFailReason("订单已取消，支付金额原路退回");
            paymentRepository.save(payment);
            return payment;
        }
        if (order.getStatus().payable() || order.getStatus() == OrderStatus.PAID) {
            order.setStatus(OrderStatus.PAID);
            order.setPaidAt(now);
            order.setPayChannel(payment.getChannel().name());
            orderRepository.save(order);
        }
        return payment;
    }

    private Payment mustGet(String paymentNo) {
        return paymentRepository.findByPaymentNo(paymentNo)
                .orElseThrow(() -> new BizException("支付单不存在"));
    }

    private PaymentGateway resolve(PaymentChannel channel) {
        return gateways.stream()
                .filter(g -> g.supports(channel))
                .findFirst()
                .orElseThrow(() -> new BizException("暂不支持的支付渠道：" + channel.getLabel()));
    }

    private String generatePaymentNo() {
        for (int i = 0; i < 20; i++) {
            String no = "PY" + LocalDateTime.now().format(NO_FORMAT)
                    + String.format("%06d", ThreadLocalRandom.current().nextInt(1_000_000));
            if (!paymentRepository.existsByPaymentNo(no)) {
                return no;
            }
        }
        throw new BizException("支付流水号生成失败，请重试");
    }

    private BigDecimal parseAmount(String v) {
        try {
            return v == null || v.isBlank() ? null : new BigDecimal(v);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private PaymentView toView(Payment p) {
        return new PaymentView(
                p.getId(),
                p.getPaymentNo(),
                p.getOrderId(),
                p.getOrderNo(),
                p.getChannel().name(),
                p.getChannel().getLabel(),
                p.getAmount(),
                p.getStatus().name(),
                p.getStatus().getLabel(),
                p.getTradeNo(),
                p.getPayUrl(),
                Boolean.TRUE.equals(p.getMock()),
                p.getFailReason(),
                p.getPaidAt(),
                p.getCreatedAt()
        );
    }
}
