package com.mall.service;

import com.mall.common.BizException;
import com.mall.dto.AfterSaleLogView;
import com.mall.dto.AfterSaleView;
import com.mall.dto.RefundView;
import com.mall.entity.*;
import com.mall.entity.enums.*;
import com.mall.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 售后服务（挑战 C.3）：
 * 1. 以订单项为单位发起申请，售后状态独立于订单状态；
 * 2. 商家线下协商的记录在系统内留痕（AfterSaleLog）；
 * 3. 处理结果为退货退款 / 仅退款 / 换货 / 维修 / 拒绝；
 * 4. 退款落独立 Refund 单，金额不超过订单项金额与订单可退余额。
 */
@Service
@RequiredArgsConstructor
public class AfterSaleService {

    private static final DateTimeFormatter NO_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    /** 交易完成后可申请售后的天数 */
    private static final int AFTER_SALE_DAYS = 7;

    private final AfterSaleRepository afterSaleRepository;
    private final AfterSaleLogRepository logRepository;
    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;

    // ===== 客户侧 =====

    @Transactional
    public AfterSaleView submit(Long customerId, Long orderItemId, AfterSaleType type,
                                String title, String description, List<String> images) {
        if (type == null) {
            throw new BizException("请选择售后类型");
        }
        if (title == null || title.isBlank()) {
            throw new BizException("请填写问题标题");
        }
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new BizException("订单商品不存在"));
        Order order = orderRepository.findByIdAndCustomerId(item.getOrderId(), customerId)
                .orElseThrow(() -> new BizException("订单不存在"));

        if (order.getStatus() != OrderStatus.SHIPPED && order.getStatus() != OrderStatus.COMPLETED) {
            throw new BizException("订单发货后才能申请售后");
        }
        if (order.getStatus() == OrderStatus.COMPLETED && order.getCompletedAt() != null
                && ChronoUnit.DAYS.between(order.getCompletedAt(), LocalDateTime.now()) > AFTER_SALE_DAYS) {
            throw new BizException("已超过交易完成后 " + AFTER_SALE_DAYS + " 天的售后申请时限");
        }

        if (afterSaleRepository.existsByOrderItemIdAndStatusIn(orderItemId,
                List.of(AfterSaleStatus.PENDING, AfterSaleStatus.NEGOTIATING, AfterSaleStatus.RETURNING))) {
            throw new BizException("该商品已有进行中的售后申请");
        }
        if (afterSaleRepository.existsByOrderItemIdAndStatusIn(orderItemId,
                List.of(AfterSaleStatus.COMPLETED))) {
            throw new BizException("该商品已完成过一次售后");
        }

        AfterSale afterSale = afterSaleRepository.save(AfterSale.builder()
                .afterSaleNo(generateNo())
                .orderId(order.getId())
                .orderNo(order.getOrderNo())
                .orderItemId(item.getId())
                .customerId(customerId)
                .productId(item.getProductId())
                .productName(item.getProductName())
                .productImage(item.getProductImage())
                .itemAmount(item.getSubtotal())
                .quantity(item.getQuantity() == null ? 1 : item.getQuantity())
                .type(type)
                .title(title.trim())
                .description(description)
                .images(joinImages(images))
                .status(AfterSaleStatus.PENDING)
                .build());

        writeLog(afterSale.getId(), "CUSTOMER", "提交售后申请：" + type.getLabel() + " - " + title.trim());
        return toView(afterSale, true);
    }

    public List<AfterSaleView> listByCustomer(Long customerId) {
        return afterSaleRepository.findByCustomerIdOrderByIdDesc(customerId).stream()
                .map(a -> toView(a, false)).toList();
    }

    public List<AfterSaleView> listByCustomerOrder(Long customerId, Long orderId) {
        orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new BizException("订单不存在"));
        return afterSaleRepository.findByOrderIdOrderByIdDesc(orderId).stream()
                .map(a -> toView(a, false)).toList();
    }

    public AfterSaleView getForCustomer(Long customerId, Long id) {
        return toView(getByCustomer(customerId, id), true);
    }

    @Transactional
    public AfterSaleView cancelByCustomer(Long customerId, Long id) {
        AfterSale afterSale = getByCustomer(customerId, id);
        if (!afterSale.getStatus().cancellable()) {
            throw new BizException("当前售后状态不可撤销");
        }
        afterSale.setStatus(AfterSaleStatus.CANCELED);
        afterSale.setCompletedAt(LocalDateTime.now());
        afterSaleRepository.save(afterSale);
        writeLog(id, "CUSTOMER", "客户撤销了售后申请");
        return toView(afterSale, true);
    }

    @Transactional
    public AfterSaleView messageByCustomer(Long customerId, Long id, String content) {
        AfterSale afterSale = getByCustomer(customerId, id);
        if (!afterSale.getStatus().active()) {
            throw new BizException("该售后单已结束，无法继续留言");
        }
        writeLog(id, "CUSTOMER", requireContent(content));
        return toView(afterSale, true);
    }

    /** 客户填写退货物流：复用 C.2 的快递公司字典与运单号 */
    @Transactional
    public AfterSaleView shipBack(Long customerId, Long id, ExpressCompany expressCompany, String trackingNo) {
        AfterSale afterSale = getByCustomer(customerId, id);
        if (afterSale.getStatus() != AfterSaleStatus.RETURNING) {
            throw new BizException("商家同意退货后才能填写退货物流");
        }
        if (expressCompany == null) {
            throw new BizException("请选择退货快递公司");
        }
        if (trackingNo == null || trackingNo.isBlank()) {
            throw new BizException("请填写退货运单号");
        }
        afterSale.setReturnExpressCompany(expressCompany);
        afterSale.setReturnTrackingNo(trackingNo.trim());
        afterSale.setReturnShippedAt(LocalDateTime.now());
        afterSaleRepository.save(afterSale);
        writeLog(id, "CUSTOMER", "客户已寄回商品：" + expressCompany.getLabel() + " " + trackingNo.trim());
        return toView(afterSale, true);
    }

    // ===== 卖家侧 =====

    public Page<AfterSaleView> listForSeller(AfterSaleStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AfterSale> result = status == null
                ? afterSaleRepository.findAllByOrderByIdDesc(pageable)
                : afterSaleRepository.findByStatusOrderByIdDesc(status, pageable);
        return result.map(a -> toView(a, false));
    }

    public AfterSaleView getForSeller(Long id) {
        return toView(getById(id), true);
    }

    /** 商家协商回复：待处理 -> 协商中 */
    @Transactional
    public AfterSaleView replyBySeller(Long id, String content) {
        AfterSale afterSale = getById(id);
        if (!afterSale.getStatus().active()) {
            throw new BizException("该售后单已结束，无法继续回复");
        }
        writeLog(id, "SELLER", requireContent(content));
        if (afterSale.getStatus() == AfterSaleStatus.PENDING) {
            afterSale.setStatus(AfterSaleStatus.NEGOTIATING);
            afterSale.setHandledAt(LocalDateTime.now());
            afterSaleRepository.save(afterSale);
        }
        return toView(afterSale, true);
    }

    /** 商家给出处理结果 */
    @Transactional
    public AfterSaleView resolveBySeller(Long id, AfterSaleResult result, BigDecimal refundAmount, String reply) {
        AfterSale afterSale = getById(id);
        if (!afterSale.getStatus().active()) {
            throw new BizException("该售后单已处理完成");
        }
        if (result == null) {
            throw new BizException("请选择处理结果");
        }
        if (afterSale.getStatus() == AfterSaleStatus.RETURNING) {
            throw new BizException("该售后正在退货流程中，请确认收到退货后再处理");
        }

        LocalDateTime now = LocalDateTime.now();
        afterSale.setResult(result);
        afterSale.setHandledAt(now);
        if (reply != null && !reply.isBlank()) {
            afterSale.setSellerReply(reply.trim());
            writeLog(id, "SELLER", reply.trim());
        }

        switch (result) {
            case REJECT -> {
                afterSale.setStatus(AfterSaleStatus.REJECTED);
                afterSale.setCompletedAt(now);
                writeLog(id, "SYSTEM", "商家拒绝了本次售后申请");
            }
            case RETURN_REFUND -> {
                afterSale.setRefundAmount(checkRefundAmount(afterSale, refundAmount));
                afterSale.setStatus(AfterSaleStatus.RETURNING);
                writeLog(id, "SYSTEM", "商家同意退货退款，请客户寄回商品并填写退货物流");
            }
            case REFUND_ONLY -> {
                afterSale.setRefundAmount(checkRefundAmount(afterSale, refundAmount));
                doRefund(afterSale);
                afterSale.setStatus(AfterSaleStatus.COMPLETED);
                afterSale.setCompletedAt(now);
            }
            case EXCHANGE, REPAIR -> {
                afterSale.setStatus(AfterSaleStatus.COMPLETED);
                afterSale.setCompletedAt(now);
                writeLog(id, "SYSTEM", "商家已按「" + result.getLabel() + "」处理完成");
            }
        }
        afterSaleRepository.save(afterSale);
        return toView(afterSale, true);
    }

    /** 商家确认收到退货 -> 执行退款 -> 售后完成 */
    @Transactional
    public AfterSaleView receiveBySeller(Long id) {
        AfterSale afterSale = getById(id);
        if (afterSale.getStatus() != AfterSaleStatus.RETURNING) {
            throw new BizException("该售后单不在退货流程中");
        }
        doRefund(afterSale);
        afterSale.setStatus(AfterSaleStatus.COMPLETED);
        afterSale.setCompletedAt(LocalDateTime.now());
        afterSaleRepository.save(afterSale);
        return toView(afterSale, true);
    }

    // ===== 内部方法 =====

    private AfterSale getById(Long id) {
        return afterSaleRepository.findById(id)
                .orElseThrow(() -> new BizException("售后单不存在"));
    }

    private AfterSale getByCustomer(Long customerId, Long id) {
        return afterSaleRepository.findByIdAndCustomerId(id, customerId)
                .orElseThrow(() -> new BizException("售后单不存在"));
    }

    /** 校验退款金额：默认取订单项金额，且不超过订单已付余额 */
    private BigDecimal checkRefundAmount(AfterSale afterSale, BigDecimal requested) {
        BigDecimal amount = requested == null ? afterSale.getItemAmount() : requested;
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BizException("退款金额必须大于 0");
        }
        if (amount.compareTo(afterSale.getItemAmount()) > 0) {
            throw new BizException("退款金额不能超过该商品金额 ¥" + afterSale.getItemAmount());
        }
        Payment payment = findSuccessfulPayment(afterSale.getOrderId());
        if (payment == null) {
            throw new BizException("该订单没有成功的线上支付记录，无法退款");
        }
        BigDecimal refunded = refundRepository.sumAmountByOrder(afterSale.getOrderId(), RefundStatus.SUCCESS);
        if (refunded == null) {
            refunded = BigDecimal.ZERO;
        }
        if (refunded.add(amount).compareTo(payment.getAmount()) > 0) {
            throw new BizException("退款金额超过订单可退余额（已付 ¥" + payment.getAmount()
                    + "，已退 ¥" + refunded + "）");
        }
        return amount;
    }

    /** 执行退款：落退款单 + 回滚库存与销量 */
    private void doRefund(AfterSale afterSale) {
        Payment payment = findSuccessfulPayment(afterSale.getOrderId());
        if (payment == null) {
            throw new BizException("该订单没有成功的线上支付记录，无法退款");
        }
        BigDecimal amount = afterSale.getRefundAmount() == null
                ? afterSale.getItemAmount() : afterSale.getRefundAmount();

        refundRepository.save(Refund.builder()
                .refundNo(generateRefundNo())
                .afterSaleId(afterSale.getId())
                .orderId(afterSale.getOrderId())
                .paymentNo(payment.getPaymentNo())
                .channel(payment.getChannel())
                .amount(amount)
                .status(RefundStatus.SUCCESS)
                .remark("售后退款：" + afterSale.getResult().getLabel())
                .refundedAt(LocalDateTime.now())
                .build());

        // 退货 / 退款视为商品退回：库存回滚、销量扣减
        if (afterSale.getProductId() != null) {
            productRepository.findById(afterSale.getProductId()).ifPresent(p -> {
                int qty = afterSale.getQuantity() == null ? 1 : afterSale.getQuantity();
                p.setStock((p.getStock() == null ? 0 : p.getStock()) + qty);
                int sales = (p.getSales() == null ? 0 : p.getSales()) - qty;
                p.setSales(Math.max(sales, 0));
                if (p.getStatus() == ProductStatus.OFF_SHELF && p.getStock() > 0) {
                    p.setStatus(ProductStatus.ON_SALE);
                }
                productRepository.save(p);
            });
        }

        writeLog(afterSale.getId(), "SYSTEM",
                "退款 ¥" + amount.toPlainString() + " 已原路退回（模拟渠道），库存已恢复");
    }

    private Payment findSuccessfulPayment(Long orderId) {
        return paymentRepository.findByOrderIdOrderByIdDesc(orderId).stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .findFirst()
                .orElse(null);
    }

    private void writeLog(Long afterSaleId, String role, String content) {
        logRepository.save(AfterSaleLog.builder()
                .afterSaleId(afterSaleId)
                .role(role)
                .content(content.length() > 500 ? content.substring(0, 500) : content)
                .build());
    }

    private String requireContent(String content) {
        if (content == null || content.isBlank()) {
            throw new BizException("请填写内容");
        }
        return content.trim();
    }

    private String joinImages(List<String> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        return images.stream().filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .reduce((a, b) -> a + "," + b)
                .orElse(null);
    }

    private List<String> splitImages(String images) {
        if (images == null || images.isBlank()) {
            return List.of();
        }
        return Arrays.stream(images.split(",")).filter(s -> !s.isBlank()).toList();
    }

    private String generateNo() {
        for (int i = 0; i < 20; i++) {
            String no = "AS" + LocalDateTime.now().format(NO_FORMAT)
                    + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
            if (!afterSaleRepository.existsByAfterSaleNo(no)) {
                return no;
            }
        }
        throw new BizException("售后单号生成失败，请重试");
    }

    private String generateRefundNo() {
        return "RF" + LocalDateTime.now().format(NO_FORMAT)
                + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
    }

    private AfterSaleView toView(AfterSale a, boolean withDetail) {
        List<AfterSaleLogView> logs = withDetail
                ? logRepository.findByAfterSaleIdOrderByIdAsc(a.getId()).stream()
                    .map(l -> new AfterSaleLogView(l.getId(), l.getRole(), l.getContent(), l.getCreatedAt()))
                    .toList()
                : List.of();

        RefundView refund = null;
        if (withDetail) {
            refund = refundRepository.findByAfterSaleIdOrderByIdDesc(a.getId()).stream()
                    .findFirst()
                    .map(r -> new RefundView(r.getRefundNo(), r.getAmount(), r.getStatus().name(),
                            r.getStatus().getLabel(),
                            r.getChannel() == null ? null : r.getChannel().name(),
                            r.getChannel() == null ? null : r.getChannel().getLabel(),
                            r.getRefundedAt()))
                    .orElse(null);
        }

        return new AfterSaleView(
                a.getId(),
                a.getAfterSaleNo(),
                a.getOrderId(),
                a.getOrderNo(),
                a.getOrderItemId(),
                a.getProductName(),
                a.getProductImage(),
                a.getItemAmount(),
                a.getQuantity(),
                a.getType().name(),
                a.getType().getLabel(),
                a.getTitle(),
                a.getDescription(),
                splitImages(a.getImages()),
                a.getStatus().name(),
                a.getStatus().getLabel(),
                a.getResult() == null ? null : a.getResult().name(),
                a.getResult() == null ? null : a.getResult().getLabel(),
                a.getRefundAmount(),
                a.getSellerReply(),
                a.getReturnExpressCompany() == null ? null : a.getReturnExpressCompany().name(),
                a.getReturnExpressCompany() == null ? null : a.getReturnExpressCompany().getLabel(),
                a.getReturnTrackingNo(),
                a.getReturnShippedAt(),
                a.getAppliedAt(),
                a.getHandledAt(),
                a.getCompletedAt(),
                logs,
                refund,
                a.getStatus().cancellable(),
                a.getStatus() == AfterSaleStatus.RETURNING,
                a.getStatus() == AfterSaleStatus.RETURNING
        );
    }
}
