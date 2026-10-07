package com.mall.config;

import com.mall.entity.Product;
import com.mall.entity.Seller;
import com.mall.entity.enums.ProductStatus;
import com.mall.repository.ProductRepository;
import com.mall.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * 启动时初始化默认卖家账号与唯一一件在售商品（单品单卖：全站在售商品恒为 1 件）。
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        if (sellerRepository.count() == 0) {
            Seller seller = Seller.builder()
                    .username("admin")
                    .password(encoder.encode("admin123"))
                    .build();
            sellerRepository.save(seller);
        }
        if (productRepository.count() == 0) {
            Product p = Product.builder()
                    .name("手工牛皮钱包 · 限量定制")
                    .description("头层牛皮，纯手工缝制，下单后约 7 天制作。全站仅此一件，售出后再制作下一件。")
                    .imageUrl("/uploads/product_10.png")
                    .category("服饰")
                    .price(new BigDecimal("199.00"))
                    .stock(1)
                    .sales(0)
                    .rating(5.0)
                    .reviewCount(0)
                    .status(ProductStatus.ON_SALE)
                    .build();
            productRepository.save(p);
        }
    }
}
