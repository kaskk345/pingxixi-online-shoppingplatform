package com.mall.service;

import com.mall.common.BizException;
import com.mall.dto.FavoriteView;
import com.mall.entity.Favorite;
import com.mall.entity.Product;
import com.mall.repository.FavoriteRepository;
import com.mall.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * 商品收藏服务。
 */
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;

    public List<FavoriteView> list(Long customerId) {
        return favoriteRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::toView)
                .toList();
    }

    public long count(Long customerId) {
        return favoriteRepository.countByCustomerId(customerId);
    }

    public boolean check(Long customerId, Long productId) {
        return favoriteRepository.existsByCustomerIdAndProductId(customerId, productId);
    }

    /** 收藏商品：重复收藏直接返回已有记录 */
    @Transactional
    public FavoriteView add(Long customerId, Long productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new BizException("商品不存在"));
        Favorite favorite = favoriteRepository.findByCustomerIdAndProductId(customerId, productId)
                .orElseGet(() -> favoriteRepository.save(Favorite.builder()
                        .customerId(customerId)
                        .productId(productId)
                        .build()));
        return toView(favorite);
    }

    @Transactional
    public void remove(Long customerId, Long productId) {
        favoriteRepository.deleteByCustomerIdAndProductId(customerId, productId);
    }

    private FavoriteView toView(Favorite f) {
        Product p = productRepository.findById(f.getProductId()).orElse(null);
        if (p == null) {
            return new FavoriteView(f.getId(), f.getProductId(), "商品已删除", null,
                    BigDecimal.ZERO, 0, null, false, f.getCreatedAt());
        }
        boolean available = p.getStatus().buyable() && p.getStock() != null && p.getStock() > 0;
        return new FavoriteView(f.getId(), p.getId(), p.getName(), firstImage(p), p.getPrice(),
                p.getStock(), p.getStatus().name(), available, f.getCreatedAt());
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
