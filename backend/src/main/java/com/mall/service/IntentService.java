package com.mall.service;

import com.mall.common.BizException;
import com.mall.dto.IntentView;
import com.mall.entity.Product;
import com.mall.entity.PurchaseIntent;
import com.mall.entity.enums.IntentStatus;
import com.mall.entity.enums.ProductStatus;
import com.mall.repository.ProductRepository;
import com.mall.repository.PurchaseIntentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * 购买意向服务（先到先得队列 + 口令码 + 库存预占）。
 *
 * 关键规则：
 * 1. 提交意向即预占 1 件库存（行锁串行化，防止超卖）；库存不足则提交失败；
 * 2. 排队按 queueTime 正序（先到先得），卖家不能跳位；
 * 3. 排第一位的意向进入交易时，商品自动冻结；
 * 4. 交易成功 -> 本单预占库存落定，其余等候意向作废并释放其预占库存；
 * 5. 交易失败 -> 释放本单预占库存，商品恢复在售，由卖家确认「作废」或「重新排队」；
 * 6. 重新排队：新建一条同码意向并重新预占 1 件库存，排队时间刷新、位次重置到队尾；
 * 7. 买家撤销等候意向 -> 释放其预占库存。
 */
@Service
@RequiredArgsConstructor
public class IntentService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉易混淆的 0O1I
    private static final SecureRandom RANDOM = new SecureRandom();

    private final PurchaseIntentRepository intentRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    // ===== 买家端 =====

    /** 提交购买意向（免注册访客） */
    @Transactional
    public PurchaseIntent submit(Long productId, String name, String phone, String note) {
        return submit(productId, null, name, phone, note);
    }

    /** 提交购买意向（注册客户可关联 customerId，用于查看历史下单） */
    @Transactional
    public PurchaseIntent submit(Long productId, Long customerId, String name, String phone, String note) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new BizException("商品不存在"));
        if (!p.getStatus().buyable()) {
            throw new BizException("商品交易中，暂不接受新的购买意向");
        }
        // 提交意向即预占 1 件库存，防止超卖
        if (!productService.reserveStock(productId)) {
            throw new BizException("商品库存不足，已被抢完");
        }
        PurchaseIntent intent = PurchaseIntent.builder()
                .productId(productId)
                .customerId(customerId)
                .buyerName(name.trim())
                .buyerPhone(phone.trim())
                .buyerNote(note)
                .priceSnapshot(p.getPrice())
                .status(IntentStatus.WAITING)
                .queueTime(LocalDateTime.now())
                .code(generateCode())
                .build();
        return intentRepository.save(intent);
    }

    /** 买家凭口令码查询：排队位次、是否进交易 */
    public IntentView track(String code) {
        PurchaseIntent intent = latestByCode(code);
        Product p = productRepository.findById(intent.getProductId()).orElse(null);
        boolean offShelfManual = p != null && p.getStatus() == ProductStatus.OFF_SHELF
                && !Boolean.TRUE.equals(p.getAutoOffShelf());
        boolean codeActive = p != null && !offShelfManual && intent.getStatus().active();
        return toView(intent, p, true, codeActive);
    }

    /** 买家凭口令码修改姓名与电话（不改变排队位次） */
    @Transactional
    public IntentView updateByCode(String code, String name, String phone) {
        PurchaseIntent intent = latestByCode(code);
        checkCodeUsable(intent);
        if (!intent.getStatus().active()) {
            throw new BizException("该意向已结束，无法修改");
        }
        intent.setBuyerName(name.trim());
        intent.setBuyerPhone(phone.trim());
        PurchaseIntent saved = intentRepository.save(intent);
        Product p = productRepository.findById(saved.getProductId()).orElse(null);
        return toView(saved, p, true, true);
    }

    /** 买家凭口令码撤销意向：从队列移除并释放预占库存，后面的依次前移 */
    @Transactional
    public void cancelByCode(String code) {
        PurchaseIntent intent = latestByCode(code);
        checkCodeUsable(intent);
        if (intent.getStatus() != IntentStatus.WAITING) {
            throw new BizException("仅「等候中」的意向可撤销，交易中请联系卖家标记失败");
        }
        intent.setStatus(IntentStatus.CANCELED);
        intentRepository.save(intent);
        // 撤销等候意向：释放其预占的库存
        productService.releaseStock(intent.getProductId());
    }

    // ===== 卖家端 =====

    /** 卖家查看意向购买人列表：先到先得正序，不含口令码 */
    public List<IntentView> listByProduct(Long productId) {
        return intentRepository.findByProductIdOrderByQueueTimeAsc(productId).stream()
                .map(i -> toView(i, productRepository.findById(i.getProductId()).orElse(null), false, false))
                .toList();
    }

    public org.springframework.data.domain.Page<IntentView> listByProduct(Long productId, org.springframework.data.domain.Pageable pageable) {
        return intentRepository.findByProductIdOrderByQueueTimeAsc(productId, pageable)
                .map(i -> toView(i, productRepository.findById(i.getProductId()).orElse(null), false, false));
    }

    /** 客户历史下单记录（客户登录后查看） */
    public List<IntentView> listByCustomer(Long customerId) {
        return intentRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(i -> toView(i, productRepository.findById(i.getProductId()).orElse(null), true, true))
                .toList();
    }

    public List<IntentView> listAll() {
        return intentRepository.findAllByOrderByQueueTimeAsc().stream()
                .map(i -> toView(i, productRepository.findById(i.getProductId()).orElse(null), false, false))
                .toList();
    }

    public org.springframework.data.domain.Page<IntentView> listAll(org.springframework.data.domain.Pageable pageable) {
        return intentRepository.findAllByOrderByQueueTimeAsc(pageable)
                .map(i -> toView(i, productRepository.findById(i.getProductId()).orElse(null), false, false));
    }

    /** 开始交易：只允许队首（最早等候的意向）进入交易，商品自动冻结 */
    @Transactional
    public PurchaseIntent startTrade(Long id) {
        PurchaseIntent intent = get(id);
        if (intent.getStatus() != IntentStatus.WAITING) {
            throw new BizException("仅「等候中」的意向可开始交易");
        }
        PurchaseIntent head = headOfQueue(intent.getProductId());
        if (!head.getId().equals(intent.getId())) {
            throw new BizException("请先到先得：只能与排在最前面的意向人交易");
        }
        Product p = productRepository.findById(intent.getProductId())
                .orElseThrow(() -> new BizException("商品不存在"));
        // 库存被抢完而自动下架的商品，仍需允许其已排队的意向进入交易
        boolean autoOff = p.getStatus() == ProductStatus.OFF_SHELF && Boolean.TRUE.equals(p.getAutoOffShelf());
        if (!p.getStatus().buyable() && !autoOff) {
            throw new BizException("商品当前不在可交易状态");
        }
        productService.freeze(p.getId()); // 进入交易 -> 自动冻结
        intent.setStatus(IntentStatus.TRADING);
        return intentRepository.save(intent);
    }

    /** 标记交易成功：本单库存已预占落定，其余等候意向作废并释放其预占库存 */
    @Transactional
    public PurchaseIntent succeed(Long id) {
        PurchaseIntent intent = get(id);
        if (intent.getStatus() != IntentStatus.TRADING) {
            throw new BizException("仅「交易中」的意向可标记成功");
        }
        intent.setStatus(IntentStatus.SUCCEEDED);
        intent.setResult(IntentStatus.SUCCEEDED);
        // 本单库存在提交时已预占，成交即消耗，不再重复扣减
        productService.markSoldByTrade(intent.getProductId());
        List<PurchaseIntent> waiting = intentRepository
                .findByProductIdAndStatusOrderByQueueTimeAsc(intent.getProductId(), IntentStatus.WAITING);
        for (PurchaseIntent other : waiting) {
            other.setStatus(IntentStatus.VOID);
            intentRepository.save(other);
        }
        // 被作废的等候意向，其预占库存要释放回商品
        for (int i = 0; i < waiting.size(); i++) {
            productService.releaseStock(intent.getProductId());
        }
        return intentRepository.save(intent);
    }

    /** 标记交易失败：释放本单预占库存，商品恢复在售 */
    @Transactional
    public PurchaseIntent fail(Long id) {
        PurchaseIntent intent = get(id);
        if (intent.getStatus() != IntentStatus.TRADING) {
            throw new BizException("仅「交易中」的意向可标记失败");
        }
        intent.setStatus(IntentStatus.FAILED);
        intent.setResult(IntentStatus.FAILED);
        productService.markRestoredByTrade(intent.getProductId());
        return intentRepository.save(intent);
    }

    /** 卖家确认：交易失败的意向作废（不再排队，库存已在失败时释放） */
    @Transactional
    public PurchaseIntent voidIntent(Long id) {
        PurchaseIntent intent = get(id);
        if (intent.getStatus() != IntentStatus.FAILED) {
            throw new BizException("仅「交易失败」的意向可作废");
        }
        intent.setStatus(IntentStatus.VOID);
        return intentRepository.save(intent);
    }

    /**
     * 卖家确认：交易失败的意向重新排队。
     * 原记录保留为「交易失败」（卖家历史留一条），新建一条同码意向并重新预占 1 件库存。
     */
    @Transactional
    public PurchaseIntent requeue(Long id) {
        PurchaseIntent old = get(id);
        if (old.getStatus() != IntentStatus.FAILED) {
            throw new BizException("仅「交易失败」的意向可重新排队");
        }
        Product p = productRepository.findById(old.getProductId())
                .orElseThrow(() -> new BizException("商品不存在"));
        if (!p.getStatus().buyable()) {
            throw new BizException("商品当前不可购买，无法重新排队");
        }
        // 重新排队需要重新预占库存
        if (!productService.reserveStock(old.getProductId())) {
            throw new BizException("商品库存不足，无法重新排队");
        }
        PurchaseIntent fresh = PurchaseIntent.builder()
                .productId(old.getProductId())
                .customerId(old.getCustomerId())
                .code(old.getCode()) // 买家侧仍是同一个口令码
                .buyerName(old.getBuyerName())
                .buyerPhone(old.getBuyerPhone())
                .buyerNote(old.getBuyerNote())
                .priceSnapshot(old.getPriceSnapshot())
                .status(IntentStatus.WAITING)
                .queueTime(LocalDateTime.now()) // 刷新排队时间 -> 位次重置到队尾
                .build();
        return intentRepository.save(fresh);
    }

    // ===== 内部方法 =====

    private PurchaseIntent get(Long id) {
        return intentRepository.findById(id)
                .orElseThrow(() -> new BizException("购买意向不存在"));
    }

    /** 队首：该商品下等候中最早的一条 */
    private PurchaseIntent headOfQueue(Long productId) {
        List<PurchaseIntent> waiting = intentRepository
                .findByProductIdAndStatusOrderByQueueTimeAsc(productId, IntentStatus.WAITING);
        if (waiting.isEmpty()) {
            throw new BizException("当前没有等候中的购买意向");
        }
        return waiting.get(0);
    }

    /** 一个口令码可能对应多条（重新排队会新增），取最新一条；优先返回仍生效的 */
    private PurchaseIntent latestByCode(String code) {
        if (code == null || code.isBlank()) {
            throw new BizException("请输入口令码");
        }
        String c = code.trim().toUpperCase();
        List<PurchaseIntent> all = intentRepository.findAll().stream()
                .filter(i -> c.equals(i.getCode()))
                .sorted(Comparator.comparing(PurchaseIntent::getQueueTime).reversed())
                .toList();
        if (all.isEmpty()) {
            throw new BizException("口令码不存在，请核对后重试");
        }
        return all.stream()
                .filter(i -> i.getStatus().active())
                .findFirst()
                .orElse(all.get(0));
    }

    /** 商品被卖家手动下架后口令码失效；因库存抢空自动下架的，仍可用（用于查看/撤销） */
    private void checkCodeUsable(PurchaseIntent intent) {
        Product p = productRepository.findById(intent.getProductId()).orElse(null);
        if (p == null) {
            throw new BizException("商品已下架，该口令码已失效");
        }
        boolean offShelfManual = p.getStatus() == ProductStatus.OFF_SHELF
                && !Boolean.TRUE.equals(p.getAutoOffShelf());
        if (offShelfManual) {
            throw new BizException("商品已下架，该口令码已失效");
        }
    }

    private String generateCode() {
        for (int i = 0; i < 20; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < 8; j++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            String code = sb.toString();
            if (intentRepository.findByCode(code).isEmpty()) {
                return code;
            }
        }
        throw new BizException("口令码生成失败，请重试");
    }

    private IntentView toView(PurchaseIntent i, Product p, boolean withCode, boolean codeActive) {
        Integer ahead = null;
        Integer position = null;
        if (i.getStatus() == IntentStatus.WAITING) {
            ahead = (int) intentRepository.countByProductIdAndStatusAndQueueTimeBefore(
                    i.getProductId(), IntentStatus.WAITING, i.getQueueTime());
            position = ahead + 1;
        }
        // 库存被抢空自动下架的商品，其已排队意向仍可操作/进入交易
        boolean usable = p != null && (p.getStatus().buyable()
                || (p.getStatus() == ProductStatus.OFF_SHELF && Boolean.TRUE.equals(p.getAutoOffShelf())));
        return new IntentView(
                i.getId(),
                i.getProductId(),
                p == null ? null : p.getName(),
                withCode ? i.getCode() : null,
                i.getBuyerName(),
                i.getBuyerPhone(),
                i.getBuyerNote(),
                i.getQueueTime(),
                i.getCreatedAt(),
                i.getStatus().name(),
                i.getStatus().getLabel(),
                i.getResult() == null ? null : i.getResult().name(),
                i.getResult() == null ? null : i.getResult().getLabel(),
                position,
                ahead,
                i.getStatus().active() && usable,
                codeActive
        );
    }
}
