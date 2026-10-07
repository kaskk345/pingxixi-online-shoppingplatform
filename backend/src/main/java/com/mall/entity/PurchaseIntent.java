package com.mall.entity;

import com.mall.entity.enums.IntentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_intent")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseIntent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;

    /**
     * 口令码：提交意向时生成，一个意向对应一个码。
     * 买家凭它查询排队位次、修改姓名电话、撤销意向；卖家侧不展示。
     * 重新排队时不换码（买家侧始终一个码），卖家侧按新排队时间另记一条，
     * 因此同一个码可能对应多条记录，这里不能加唯一约束。
     */
    @Column(nullable = false, length = 16)
    private String code;

    @Column(nullable = false, length = 50)
    private String buyerName;

    @Column(nullable = false, length = 20)
    private String buyerPhone;

    @Column(length = 255)
    private String buyerNote;

    /** 下单时价格快照，避免改价纠纷 */
    @Column(precision = 10, scale = 2)
    private BigDecimal priceSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IntentStatus status;

    /** 交易结果：成功 / 失败（null 表示尚无结果） */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private IntentStatus result;

    /** 排队时间：先到先得的排序依据，重新排队时刷新为当前时间（位次重置到队尾） */
    @Column(nullable = false)
    private LocalDateTime queueTime;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (queueTime == null) {
            queueTime = now;
        }
        if (status == null) {
            status = IntentStatus.WAITING;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
