package com.mall.service;

import com.mall.common.BizException;
import com.mall.dto.OrderItemView;
import com.mall.dto.OrderView;
import com.mall.entity.CartItem;
import com.mall.entity.Order;
import com.mall.entity.OrderItem;
import com.mall.entity.Product;
import com.mall.entity.enums.OrderStatus;
import com.mall.entity.enums.ProductStatus;
import com.mall.repository.CartItemRepository;
import com.mall.repository.OrderItemRepository;
import com.mall.repository.OrderRepository;
import com.mall.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * 订单服务（升级版）：
 * 1. 订单来源为购物车勾选的多件商品，下单即扣减库存并生成价格快照；
 * 2. 状态流转：客户下单 -> 商家确认 -> 备货完成 -> 开始发货 -> 交易完成；
 * 3. 开始发货前客户可取消，交易完成前商家可取消，取消后库存回滚；
 * 4. 交易完成时累计销量。
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private static final DateTimeFormatter NO_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    // ===== 买家端 =====

    /** 购物车勾选商品下单（多件商品一个订单） */
    @Transactional
    public OrderView checkoutFromCart(Long customerId, List<Long> itemIds, String buyerName, String buyerPhone,
                                      String address, String remark) {
        if (itemIds == null || itemIds.isEmpty()) {
            throw new BizException("请选择要下单的商品");
        }
        List<CartItem> cartItems = cartItemRepository.findByIdInAndCustomerId(itemIds, customerId);
        if (cartItems.isEmpty()) {
            throw new BizException("购物车中未找到所选商品");
        }
        if (cartItems.size() != itemIds.stream().distinct().count()) {
            throw new BizException("部分商品已不在购物车中，请刷新后重试");
        }

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        int itemCount = 0;

        for (CartItem ci : cartItems) {
            Product p = productRepository.findById(ci.getProductId())
                    .orElseThrow(() -> new BizException("商品不存在或已删除"));
            int qty = ci.getQuantity() == null ? 1 : ci.getQuantity();
            if (!p.getStatus().buyable()) {
                throw new BizException("商品「" + p.getName() + "」当前不可购买");
            }
            if (p.getStock() == null || p.getStock() < qty) {
                throw new BizException("商品「" + p.getName() + "」库存不足，仅剩 " + (p.getStock() == null ? 0 : p.getStock()) + " 件");
            }
            BigDecimal subtotal = p.getPrice().multiply(BigDecimal.valueOf(qty));
            items.add(OrderItem.builder()
                    .productId(p.getId())
                    .productName(p.getName())
                    .productImage(firstImage(p))
                    .price(p.getPrice())
                    .quantity(qty)
                    .subtotal(subtotal)
                    .build());
            total = total.add(subtotal);
            itemCount += qty;

            int left = p.getStock() - qty;
            p.setStock(left);
            if (left <= 0) {
                p.setStatus(ProductStatus.OFF_SHELF);
            }
            productRepository.save(p);
        }

        Order order = orderRepository.save(Order.builder()
                .orderNo(generateOrderNo())
                .customerId(customerId)
                .buyerName(buyerName.trim())
                .buyerPhone(buyerPhone.trim())
                .address(address)
                .remark(remark)
                .totalAmount(total)
                .itemCount(itemCount)
                .status(OrderStatus.PLACED)
                .build());

        for (OrderItem item : items) {
            item.setOrderId(order.getId());
            orderItemRepository.save(item);
        }
        cartItemRepository.deleteAll(cartItems);

        return toView(order, items);
    }

    /** 客户订单列表 */
    public List<OrderView> listByCustomer(Long customerId) {
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return toViews(orders);
    }

    /** 客户查看订单详情 */
    public OrderView getForCustomer(Long customerId, Long orderId) {
        Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new BizException("订单不存在"));
        return toView(order, orderItemRepository.findByOrderIdOrderByIdAsc(orderId));
    }

    /** 客户取消订单：开始发货前可取消 */
    @Transactional
    public OrderView cancelByCustomer(Long customerId, Long orderId, String reason) {
        Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new BizException("订单不存在"));
        if (order.getStatus() == OrderStatus.CANCELED) {
            throw new BizException("订单已取消，无需重复操作");
        }
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new BizException("订单已交易完成，无法取消");
        }
        if (!order.getStatus().cancellableByCustomer()) {
            throw new BizException("订单已开始发货，无法取消");
        }
        doCancel(order, "CUSTOMER", reason);
        return toView(order, orderItemRepository.findByOrderIdOrderByIdAsc(orderId));
    }

    // ===== 卖家端 =====

    public Page<OrderView> listAll(OrderStatus status, Pageable pageable) {
        Page<Order> page = status == null
                ? orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                : orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return page.map(o -> toView(o, orderItemRepository.findByOrderIdOrderByIdAsc(o.getId())));
    }

    public OrderView get(Long orderId) {
        Order order = getOrder(orderId);
        return toView(order, orderItemRepository.findByOrderIdOrderByIdAsc(orderId));
    }

    /** 商家确认订单：客户下单 -> 商家确认 */
    @Transactional
    public OrderView confirm(Long orderId) {
        Order order = getOrder(orderId);
        requireStatus(order, OrderStatus.PLACED, "仅「客户下单」的订单可确认");
        order.setStatus(OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());
        orderRepository.save(order);
        return toView(order, orderItemRepository.findByOrderIdOrderByIdAsc(orderId));
    }

    /** 备货完成：商家确认 -> 备货完成 */
    @Transactional
    public OrderView prepare(Long orderId) {
        Order order = getOrder(orderId);
        requireStatus(order, OrderStatus.CONFIRMED, "仅「商家确认」的订单可标记备货完成");
        order.setStatus(OrderStatus.PREPARED);
        order.setPreparedAt(LocalDateTime.now());
        orderRepository.save(order);
        return toView(order, orderItemRepository.findByOrderIdOrderByIdAsc(orderId));
    }

    /** 开始发货：备货完成 -> 开始发货（此后客户不可取消） */
    @Transactional
    public OrderView ship(Long orderId) {
        Order order = getOrder(orderId);
        requireStatus(order, OrderStatus.PREPARED, "仅「备货完成」的订单可开始发货");
        order.setStatus(OrderStatus.SHIPPED);
        order.setShippedAt(LocalDateTime.now());
        orderRepository.save(order);
        return toView(order, orderItemRepository.findByOrderIdOrderByIdAsc(orderId));
    }

    /** 交易完成：开始发货 -> 交易完成，累计销量 */
    @Transactional
    public OrderView complete(Long orderId) {
        Order order = getOrder(orderId);
        requireStatus(order, OrderStatus.SHIPPED, "仅「开始发货」的订单可标记交易完成");
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        orderRepository.save(order);
        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByIdAsc(orderId);
        for (OrderItem item : items) {
            productRepository.findById(item.getProductId()).ifPresent(p -> {
                p.setSales((p.getSales() == null ? 0 : p.getSales()) + item.getQuantity());
                productRepository.save(p);
            });
        }
        return toView(order, items);
    }

    /** 商家取消订单：交易完成前可取消，库存回滚 */
    @Transactional
    public OrderView cancelBySeller(Long orderId, String reason) {
        Order order = getOrder(orderId);
        if (order.getStatus() == OrderStatus.CANCELED) {
            throw new BizException("订单已取消，无需重复操作");
        }
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new BizException("订单已交易完成，无法取消");
        }
        doCancel(order, "SELLER", reason);
        return toView(order, orderItemRepository.findByOrderIdOrderByIdAsc(orderId));
    }

    // ===== 内部方法 =====

    private Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new BizException("订单不存在"));
    }

    private void requireStatus(Order order, OrderStatus expected, String message) {
        if (order.getStatus() != expected) {
            throw new BizException(message);
        }
    }

    /** 取消订单：置为已取消并回滚库存 */
    private void doCancel(Order order, String by, String reason) {
        order.setStatus(OrderStatus.CANCELED);
        order.setCanceledBy(by);
        order.setCancelReason(reason);
        order.setCanceledAt(LocalDateTime.now());
        orderRepository.save(order);
        for (OrderItem item : orderItemRepository.findByOrderIdOrderByIdAsc(order.getId())) {
            productRepository.findById(item.getProductId()).ifPresent(p -> {
                int stock = (p.getStock() == null ? 0 : p.getStock()) + item.getQuantity();
                p.setStock(stock);
                if (p.getStatus() == ProductStatus.OFF_SHELF && stock > 0) {
                    p.setStatus(ProductStatus.ON_SALE);
                }
                productRepository.save(p);
            });
        }
    }

    private String generateOrderNo() {
        for (int i = 0; i < 20; i++) {
            String no = "SO" + LocalDateTime.now().format(NO_FORMAT)
                    + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
            if (!orderRepository.existsByOrderNo(no)) {
                return no;
            }
        }
        throw new BizException("订单号生成失败，请重试");
    }

    private String firstImage(Product p) {
        if (p.getImages() != null) {
            for (String s : p.getImages().split(",")) {
                if (!s.isBlank()) {
                    return s.trim();
                }
            }
        }
        return p.getImageUrl();
    }

    private List<OrderView> toViews(List<Order> orders) {
        if (orders.isEmpty()) {
            return List.of();
        }
        Map<Long, List<OrderItem>> grouped = orderItemRepository
                .findByOrderIdIn(orders.stream().map(Order::getId).toList())
                .stream()
                .collect(Collectors.groupingBy(OrderItem::getOrderId));
        return orders.stream()
                .map(o -> toView(o, grouped.getOrDefault(o.getId(), List.of())))
                .toList();
    }

    private OrderView toView(Order o, List<OrderItem> items) {
        List<OrderItemView> views = items.stream()
                .map(i -> new OrderItemView(i.getId(), i.getProductId(), i.getProductName(),
                        i.getProductImage(), i.getPrice(), i.getQuantity(), i.getSubtotal()))
                .toList();
        return new OrderView(
                o.getId(),
                o.getOrderNo(),
                o.getCustomerId(),
                o.getBuyerName(),
                o.getBuyerPhone(),
                o.getAddress(),
                o.getRemark(),
                o.getTotalAmount(),
                o.getItemCount(),
                o.getStatus().name(),
                o.getStatus().getLabel(),
                o.getCanceledBy(),
                o.getCancelReason(),
                views,
                o.getCreatedAt(),
                o.getConfirmedAt(),
                o.getPreparedAt(),
                o.getShippedAt(),
                o.getCompletedAt(),
                o.getCanceledAt(),
                o.getStatus().cancellableByCustomer(),
                o.getStatus().cancellableBySeller()
        );
    }
}
