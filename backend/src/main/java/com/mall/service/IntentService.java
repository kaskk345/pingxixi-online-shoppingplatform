package com.mall.service;

import com.mall.common.BizException;
import com.mall.dto.IntentView;
import com.mall.entity.Product;
import com.mall.entity.PurchaseIntent;
import com.mall.entity.enums.IntentStatus;
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
 * 购买意向服务（先到先得队列 + 口令码）。
 *
 * 关键规则：
 * 1. 买家不注册，每次提交生成一条独立意向与一个口令码；
 * 2. 排队按 queueTime 正序（先到先得），卖家不能跳位；
 * 3. 排第一位的意向进入交易时，商品自动冻结；
 * 4. 交易成功 -> 商品已下架，其余等候意向作废；
 * 5. 交易失败 -> 商品已恢复在售，由卖家确认「作废」或「重新排队」；
 * 6. 重新排队：新建一条同码意向，排队时间刷新、位次重置到队尾，买家侧仍用原码；
 * 7. 口令码在交易结束或商品下架后失效。
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

    /** 提交购买意向：只填姓名与电话，生成一个口令码 */
    @Transactional
    public PurchaseIntent submit(Long productId, String name, String phone, String note) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new BizException("商品不存在"));
        if (!p.getStatus().buyable()) {
            throw new BizException("商品交易中，暂不接受新的购买意向");
        }
        PurchaseIntent intent = PurchaseIntent.builder()
                .productId(productId)
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
        boolean codeActive = p != null && p.getStatus() != com.mall.entity.enums.ProductStatus.OFF_SHELF
                && intent.getStatus().active();
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

    /** 买家凭口令码撤销意向：从队列移除，后面的依次前移 */
    @Transactional
    public void cancelByCode(String code) {
        PurchaseIntent intent = latestByCode(code);
        checkCodeUsable(intent);
        if (intent.getStatus() != IntentStatus.WAITING) {
            throw new BizException("仅「等候中」的意向可撤销，交易中请联系卖家标记失败");
        }
        intent.setStatus(IntentStatus.CANCELED);
        intentRepository.save(intent);
    }

    // ===== 卖家端 =====

    /** 卖家查看意向购买人列表：先到先得正序，不含口令码 */
    public List<IntentView> listByProduct(Long productId) {
        return intentRepository.findByProductIdOrderByQueueTimeAsc(productId).stream()
                .map(i -> toView(i, productRepository.findById(i.getProductId()).orElse(null), false, false))
                .toList();
    }

    public List<IntentView> listAll() {
        return intentRepository.findAllByOrderByQueueTimeAsc().stream()
                .map(i -> toView(i, productRepository.findById(i.getProductId()).orElse(null), false, false))
                .toList();
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
        if (!p.getStatus().buyable()) {
            throw new BizException("商品当前不在可交易状态");
        }
        productService.freeze(p.getId()); // 进入交易 -> 自动冻结
        intent.setStatus(IntentStatus.TRADING);
        return intentRepository.save(intent);
    }

    /** 标记交易成功：商品直接已下架，其余等候意向作废 */
    @Transactional
    public PurchaseIntent succeed(Long id) {
        PurchaseIntent intent = get(id);
        if (intent.getStatus() != IntentStatus.TRADING) {
            throw new BizException("仅「交易中」的意向可标记成功");
        }
        intent.setStatus(IntentStatus.SUCCEEDED);
        intent.setResult(IntentStatus.SUCCEEDED);
        productService.markSoldByTrade(intent.getProductId());
        for (PurchaseIntent other : intentRepository
                .findByProductIdAndStatusOrderByQueueTimeAsc(intent.getProductId(), IntentStatus.WAITING)) {
            other.setStatus(IntentStatus.VOID);
            intentRepository.save(other);
        }
        return intentRepository.save(intent);
    }

    /** 标记交易失败：商品恢复在售（已恢复在售），后续由卖家确认作废或重新排队 */
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

    /** 卖家确认：交易失败的意向作废（不再排队） */
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
     * 原记录保留为「交易失败」（卖家历史留一条），新建一条同码意向，排队时间刷新、位次重置到队尾。
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
        PurchaseIntent fresh = PurchaseIntent.builder()
                .productId(old.getProductId())
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

    /** 商品下架后口令码失效 */
    private void checkCodeUsable(PurchaseIntent intent) {
        Product p = productRepository.findById(intent.getProductId()).orElse(null);
        if (p == null || p.getStatus() == com.mall.entity.enums.ProductStatus.OFF_SHELF) {
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
                i.getStatus().active() && p != null && p.getStatus().buyable(),
                codeActive
        );
    }
}
