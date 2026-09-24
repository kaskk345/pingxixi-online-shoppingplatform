package com.mall.service;

import com.mall.common.BizException;
import com.mall.entity.Product;
import com.mall.entity.PurchaseIntent;
import com.mall.entity.enums.IntentStatus;
import com.mall.entity.enums.ProductStatus;
import com.mall.repository.ProductRepository;
import com.mall.repository.PurchaseIntentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IntentService {

    private final PurchaseIntentRepository intentRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public PurchaseIntent submit(Long productId, String name, String phone, String note) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new BizException("商品不存在"));
        if (p.getStatus() != ProductStatus.ON_SALE) {
            throw new BizException("该商品当前不可购买（可能已被冻结或售出）");
        }
        boolean dup = intentRepository
                .findByBuyerPhoneAndProductIdAndStatus(phone, productId, IntentStatus.PENDING)
                .isPresent();
        if (dup) {
            throw new BizException("您已提交过该商品的购买意向，请勿重复提交");
        }
        PurchaseIntent intent = PurchaseIntent.builder()
                .productId(productId).buyerName(name).buyerPhone(phone)
                .buyerNote(note).priceSnapshot(p.getPrice())
                .status(IntentStatus.PENDING).build();
        return intentRepository.save(intent);
    }

    public PurchaseIntent query(String phone, Long id) {
        return intentRepository.findByIdAndBuyerPhone(id, phone)
                .orElseThrow(() -> new BizException("未找到对应的购买意向，请核对手机号与意向编号"));
    }

    public List<PurchaseIntent> listAll() {
        return intentRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public PurchaseIntent accept(Long id) {
        PurchaseIntent intent = get(id);
        if (intent.getStatus() != IntentStatus.PENDING) {
            throw new BizException("仅「待处理」意向可同意");
        }
        Product p = productRepository.findById(intent.getProductId())
                .orElseThrow(() -> new BizException("商品不存在"));
        if (p.getStatus() == ProductStatus.ON_SALE) {
            productService.freeze(p.getId());
        }
        intent.setStatus(IntentStatus.ACCEPTED);
        // 同一商品的其他待处理意向置为「已失效」
        List<PurchaseIntent> others = intentRepository
                .findByProductIdAndStatus(intent.getProductId(), IntentStatus.PENDING);
        for (PurchaseIntent o : others) {
            if (!o.getId().equals(intent.getId())) {
                o.setStatus(IntentStatus.EXPIRED);
                intentRepository.save(o);
            }
        }
        return intentRepository.save(intent);
    }

    @Transactional
    public PurchaseIntent reject(Long id) {
        PurchaseIntent intent = get(id);
        if (intent.getStatus() != IntentStatus.PENDING) {
            throw new BizException("仅「待处理」意向可拒绝");
        }
        intent.setStatus(IntentStatus.REJECTED);
        return intentRepository.save(intent);
    }

    @Transactional
    public PurchaseIntent succeed(Long id) {
        PurchaseIntent intent = get(id);
        if (intent.getStatus() != IntentStatus.ACCEPTED) {
            throw new BizException("仅「交易中」意向可登记成交");
        }
        intent.setStatus(IntentStatus.SUCCEEDED);
        productService.markSold(intent.getProductId());
        return intentRepository.save(intent);
    }

    @Transactional
    public PurchaseIntent fail(Long id) {
        PurchaseIntent intent = get(id);
        if (intent.getStatus() != IntentStatus.ACCEPTED) {
            throw new BizException("仅「交易中」意向可登记失败");
        }
        intent.setStatus(IntentStatus.FAILED);
        productService.restore(intent.getProductId());
        return intentRepository.save(intent);
    }

    private PurchaseIntent get(Long id) {
        return intentRepository.findById(id)
                .orElseThrow(() -> new BizException("购买意向不存在"));
    }
}
