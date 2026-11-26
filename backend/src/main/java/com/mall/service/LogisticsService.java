package com.mall.service;

import com.mall.common.BizException;
import com.mall.dto.LogisticsTraceView;
import com.mall.dto.LogisticsView;
import com.mall.entity.LogisticsTrace;
import com.mall.entity.Order;
import com.mall.entity.enums.ExpressCompany;
import com.mall.entity.enums.LogisticsStatus;
import com.mall.repository.LogisticsTraceRepository;
import com.mall.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 线下配送与物流状态（挑战 C.2）。
 *
 * <p>状态由系统内维护，不对接任何快递公司开放平台：
 * 发货时记录快递公司与运单号并置为「已揽收」，之后由卖家逐档推进
 * 已揽收 → 运输中 → 派送中 → 已签收，每次推进写一条轨迹供买家查看。</p>
 */
@Service
@RequiredArgsConstructor
public class LogisticsService {

    private static final DateTimeFormatter NO_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final OrderRepository orderRepository;
    private final LogisticsTraceRepository traceRepository;

    /** 发货：绑定运单并写入首条轨迹 */
    @Transactional
    public Order ship(Order order, ExpressCompany company, String trackingNo) {
        ExpressCompany express = company == null ? ExpressCompany.SF : company;
        String no = trackingNo == null || trackingNo.isBlank()
                ? generateTrackingNo(express) : trackingNo.trim();

        order.setExpressCompany(express);
        order.setTrackingNo(no);
        order.setLogisticsStatus(LogisticsStatus.COLLECTED);
        order.setShippedAt(LocalDateTime.now());
        order.setSignedAt(null);
        orderRepository.save(order);

        writeTrace(order, LogisticsStatus.COLLECTED,
                "快件已由「" + express.getLabel() + "」揽收，运单号 " + no);
        return order;
    }

    /** 更新物流：推进一档状态并写入轨迹 */
    @Transactional
    public Order advance(Order order) {
        LogisticsStatus current = order.getLogisticsStatus();
        if (current == null) {
            throw new BizException("该订单尚未发货，暂无物流信息");
        }
        if (current.finished()) {
            throw new BizException("物流已签收，无需继续更新");
        }
        LogisticsStatus next = current.next();
        order.setLogisticsStatus(next);
        if (next == LogisticsStatus.SIGNED) {
            order.setSignedAt(LocalDateTime.now());
        }
        orderRepository.save(order);
        writeTrace(order, next, describe(next, order));
        return order;
    }

    public LogisticsView detailForCustomer(Long customerId, Long orderId) {
        Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new BizException("订单不存在"));
        return toView(order);
    }

    public LogisticsView detailForSeller(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BizException("订单不存在"));
        return toView(order);
    }

    // ===== 内部方法 =====

    private void writeTrace(Order order, LogisticsStatus status, String description) {
        traceRepository.save(LogisticsTrace.builder()
                .orderId(order.getId())
                .status(status)
                .description(description)
                .location(shortLocation(order.getAddress()))
                .occurredAt(LocalDateTime.now())
                .build());
    }

    private String describe(LogisticsStatus status, Order order) {
        String city = shortLocation(order.getAddress());
        String company = order.getExpressCompany() == null ? "快递" : order.getExpressCompany().getLabel();
        return switch (status) {
            case IN_TRANSIT -> "快件已从【" + city + "】发出，正在运输途中";
            case DELIVERING -> "快件已到达【" + city + "】派送点，快递员正在派送";
            case SIGNED -> "快件已签收，感谢使用「" + company + "」";
            default -> "快件状态已更新为「" + status.getLabel() + "」";
        };
    }

    private String shortLocation(String address) {
        if (address == null || address.isBlank()) {
            return "目的地";
        }
        String s = address.trim();
        return s.length() <= 20 ? s : s.substring(0, 20);
    }

    private String generateTrackingNo(ExpressCompany company) {
        return company.getPrefix()
                + LocalDateTime.now().format(NO_FORMAT)
                + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
    }

    private LogisticsView toView(Order order) {
        List<LogisticsTraceView> traces = traceRepository
                .findByOrderIdOrderByOccurredAtDesc(order.getId()).stream()
                .map(t -> new LogisticsTraceView(
                        t.getId(),
                        t.getStatus().name(),
                        t.getStatus().getLabel(),
                        t.getDescription(),
                        t.getLocation(),
                        t.getOccurredAt()))
                .toList();
        ExpressCompany company = order.getExpressCompany();
        LogisticsStatus status = order.getLogisticsStatus();
        return new LogisticsView(
                order.getId(),
                order.getOrderNo(),
                order.getBuyerName(),
                order.getBuyerPhone(),
                order.getAddress(),
                company == null ? null : company.name(),
                company == null ? null : company.getLabel(),
                order.getTrackingNo(),
                status == null ? null : status.name(),
                status == null ? null : status.getLabel(),
                order.getShippedAt(),
                order.getSignedAt(),
                traces
        );
    }
}
