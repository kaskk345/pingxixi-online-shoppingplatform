package com.mall.config;

import com.mall.entity.Category;
import com.mall.entity.Customer;
import com.mall.entity.Product;
import com.mall.entity.Seller;
import com.mall.entity.enums.ProductStatus;
import com.mall.repository.CategoryRepository;
import com.mall.repository.CustomerRepository;
import com.mall.repository.ProductRepository;
import com.mall.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * 启动初始化：默认卖家、两级分类、多件示例商品、示例客户。
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CustomerRepository customerRepository;

    @Override
    public void run(String... args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        if (sellerRepository.count() == 0) {
            sellerRepository.save(Seller.builder()
                    .username("admin")
                    .password(encoder.encode("admin123"))
                    .build());
        }

        initCategories();

        if (productRepository.count() == 0) {
            productRepository.save(Product.builder()
                    .name("手工牛皮钱包 · 限量定制")
                    .description("头层牛皮，纯手工缝制，下单后约 7 天制作。")
                    .imageUrl("/uploads/product_10.png").images("/uploads/product_10.png")
                    .category("服饰").categoryL2("配饰")
                    .price(new BigDecimal("199.00")).stock(5).sales(0).rating(5.0).reviewCount(0)
                    .status(ProductStatus.ON_SALE).build());
            productRepository.save(Product.builder()
                    .name("陶瓷马克杯 · 手作")
                    .description("手工拉坯，釉色随机，每只略有差异。")
                    .imageUrl("/uploads/product_10.png").images("/uploads/product_10.png")
                    .category("家居").categoryL2("餐具")
                    .price(new BigDecimal("59.00")).stock(2).sales(0).rating(5.0).reviewCount(0)
                    .status(ProductStatus.ON_SALE).build());
            productRepository.save(Product.builder()
                    .name("黄铜书签 · 套装")
                    .description("黄铜材质，一套两枚，库存售罄自动下架。")
                    .imageUrl("/uploads/product_10.png").images("/uploads/product_10.png")
                    .category("数码").categoryL2("配件")
                    .price(new BigDecimal("39.00")).stock(0).sales(0).rating(5.0).reviewCount(0)
                    .status(ProductStatus.OFF_SHELF).build());
        }

        if (customerRepository.count() == 0) {
            customerRepository.save(Customer.builder()
                    .username("buyer1")
                    .password(encoder.encode("123456"))
                    .phone("13800000001")
                    .defaultAddress("华东师范大学")
                    .build());
        }
    }

    private void initCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }
        Category digital = categoryRepository.save(Category.builder().name("数码").sort(1).build());
        Category apparel = categoryRepository.save(Category.builder().name("服饰").sort(2).build());
        Category home = categoryRepository.save(Category.builder().name("家居").sort(3).build());

        categoryRepository.save(Category.builder().name("配件").parentId(digital.getId()).sort(1).build());
        categoryRepository.save(Category.builder().name("配饰").parentId(apparel.getId()).sort(1).build());
        categoryRepository.save(Category.builder().name("餐具").parentId(home.getId()).sort(1).build());
        categoryRepository.save(Category.builder().name("收纳").parentId(home.getId()).sort(2).build());
    }
}
