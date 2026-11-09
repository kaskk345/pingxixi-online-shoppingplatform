package com.mall.entity.enums;

/**
 * 订单状态机（五状态 + 取消终态）：
 *   客户下单 --(商家确认)--> 商家确认 --(备货完成)--> 备货完成
 *   --(开始发货)--> 开始发货 --(交易完成)--> 交易完成
 *
 * 取消规则：
 * 1. 「开始发货」之前客户可自行取消（客户下单 / 商家确认 / 备货完成）；
 * 2. 「交易完成」之前商家可取消（除交易完成与已取消外的所有状态）。
 */
public enum OrderStatus {
    PLACED("客户下单"),
    CONFIRMED("商家确认"),
    PREPARED("备货完成"),
    SHIPPED("开始发货"),
    COMPLETED("交易完成"),
    CANCELED("已取消");

    private final String label;

    OrderStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    /** 客户可取消：开始发货状态之前 */
    public boolean cancellableByCustomer() {
        return this == PLACED || this == CONFIRMED || this == PREPARED;
    }

    /** 商家可取消：交易完成状态之前 */
    public boolean cancellableBySeller() {
        return this != COMPLETED && this != CANCELED;
    }

    /** 是否仍在履约流程中 */
    public boolean active() {
        return this != COMPLETED && this != CANCELED;
    }
}
