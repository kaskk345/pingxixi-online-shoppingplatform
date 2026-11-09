package com.mall.service;

import com.mall.common.BizException;
import com.mall.dto.CartItemView;
import com.mall.entity.CartItem;
import com.mall.entity.Favorite;
import com.mall.entity.Product;
import com.mall.repository.CartItemRepository;
import com.mall.repository.FavoriteRepository;
import com.mall.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * 购物车服务：
 * 1. 同一商品重复加入累加数量，数量不超过库存；
 * 2. 支持勾选多条转为收藏（收藏已存在则跳过，购物车条目移除）；
 * 3. 多件商品的合并下单在 OrderService 中完成。
 */
@Service
@RequiredArgsConstructor
public class CartService {

    private static final int MAX_QUANTITY = 99;

    private final CartItemRepository cartItemRepository;
    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;

    /** 购物车列表：实时读取商品价格、库存与状态 */
    public List<CartItemView> list(Long customerId) {
        return cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::toView)
                .toList();
    }

    public long count(Long customerId) {
        return cartItemRepository.countByCustomerId(customerId);
    }

    /** 加入购物车：已存在则累加数量 */
    @Transactional
    public CartItemView add(Long customerId, Long productId, Integer quantity) {
        Product p = getBuyable(productId);
        int qty = quantity == null || quantity < 1 ? 1 : quantity;
        CartItem item = cartItemRepository.findByCustomerIdAndProductId(customerId, productId).orElse(null);
        int target = (item == null ? 0 : item.getQuantity()) + qty;
        checkStock(p, target);
        if (item == null) {
            item = CartItem.builder()
                    .customerId(customerId)
                    .productId(productId)
                    .quantity(target)
                    .build();
        } else {
            item.setQuantity(target);
        }
        return toView(cartItemRepository.save(item));
    }

    /** 修改数量 */
    @Transactional
    public CartItemView updateQuantity(Long customerId, Long itemId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new BizException("数量至少为 1");
        }
        CartItem item = getItem(customerId, itemId);
        Product p = getBuyable(item.getProductId());
        checkStock(p, quantity);
        item.setQuantity(quantity);
        return toView(cartItemRepository.save(item));
    }

    @Transactional
    public void remove(Long customerId, Long itemId) {
        cartItemRepository.delete(getItem(customerId, itemId));
    }

    @Transactional
    public void clear(Long customerId) {
        cartItemRepository.deleteAll(cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(customerId));
    }

    /** 勾选购物车条目转为收藏：返回成功转移的条数 */
    @Transactional
    public int moveToFavorites(Long customerId, List<Long> itemIds) {
        if (itemIds == null || itemIds.isEmpty()) {
            throw new BizException("请选择要转为收藏的商品");
        }
        List<CartItem> items = cartItemRepository.findByIdInAndCustomerId(itemIds, customerId);
        if (items.isEmpty()) {
            throw new BizException("未找到所选购物车商品");
        }
        int moved = 0;
        for (CartItem item : items) {
            if (!favoriteRepository.existsByCustomerIdAndProductId(customerId, item.getProductId())) {
                favoriteRepository.save(Favorite.builder()
                        .customerId(customerId)
                        .productId(item.getProductId())
                        .build());
            }
            cartItemRepository.delete(item);
            moved++;
        }
        return moved;
    }

    private CartItem getItem(Long customerId, Long itemId) {
        return cartItemRepository.findByIdAndCustomerId(itemId, customerId)
                .orElseThrow(() -> new BizException("购物车商品不存在"));
    }

    private Product getBuyable(Long productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new BizException("商品不存在"));
        if (!p.getStatus().buyable()) {
            throw new BizException("商品「" + p.getName() + "」当前不可购买");
        }
        return p;
    }

    private void checkStock(Product p, int quantity) {
        if (quantity > MAX_QUANTITY) {
            throw new BizException("单件商品最多购买 " + MAX_QUANTITY + " 件");
        }
        int stock = p.getStock() == null ? 0 : p.getStock();
        if (quantity > stock) {
            throw new BizException("商品「" + p.getName() + "」库存不足，仅剩 " + stock + " 件");
        }
    }

    private CartItemView toView(CartItem item) {
        Product p = productRepository.findById(item.getProductId()).orElse(null);
        if (p == null) {
            return new CartItemView(item.getId(), item.getProductId(), "商品已删除", null,
                    BigDecimal.ZERO, item.getQuantity(), BigDecimal.ZERO, 0, null, false, item.getCreatedAt());
        }
        BigDecimal subtotal = p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        boolean available = p.getStatus().buyable() && p.getStock() != null && p.getStock() > 0;
        return new CartItemView(item.getId(), p.getId(), p.getName(), firstImage(p), p.getPrice(),
                item.getQuantity(), subtotal, p.getStock(), p.getStatus().name(), available, item.getCreatedAt());
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
}
