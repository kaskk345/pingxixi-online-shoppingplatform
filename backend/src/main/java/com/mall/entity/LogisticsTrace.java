package com.mall.entity;

import com.mall.entity.enums.LogisticsStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 物流轨迹节点：每次发货 / 更新物流状态写一条，买家端渲染成时间线。
 */
@Entity
@Table(name = "logistics_trace", indexes = {
        @Index(name = "idx_trace_order", columnList = "orderId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticsTrace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LogisticsStatus status;

    @Column(nullable = false, length = 255)
    private String description;

    /** 发生地点，取订单收货地址，仅作展示 */
    @Column(length = 100)
    private String location;

    @Column(nullable = false)
    private LocalDateTime occurredAt;

    @PrePersist
    void prePersist() {
        if (occurredAt == null) {
            occurredAt = LocalDateTime.now();
        }
    }
}
