package com.mall.entity.enums;

/**
 * 订单状态机（挑战 B 五状态 + 挑战 C.1 支付两状态 + 取消终态）：
 *
 *   客户下单 --(创建支付单)--> 待支付 --(支付成功)--> 已支付
 *   --(商家确认)--> 商家确认 --(备货完成)--> 备货完成
 *   --(开始发货)--> 开始发货 --(交易完成)--> 交易完成
 *
 * 取消规则：
 * 1. 「开始发货」之前客户可自行取消（客户下单 / 待支付 / 已支付 / 商家确认 / 备货完成）；
 * 2. 「交易完成」之前商家可取消（除交易完成与已取消外的所有状态）；
 * 3. 已支付订单取消时，支付单同步置为已退款（见 PaymentService#refundByCancel）。
 */
public enum OrderStatus {
    PLACED("客户下单"),
    PENDING_PAY("待支付"),
    PAID("已支付"),
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

    /** 是否可发起线上支付：客户下单 / 待支付（未支付前均可） */
    public boolean payable() {
        return this == PLACED || this == PENDING_PAY;
    }

    /** 客户可取消：开始发货状态之前 */
    public boolean cancellableByCustomer() {
        return this == PLACED || this == PENDING_PAY || this == PAID
                || this == CONFIRMED || this == PREPARED;
    }

    /** 商家可取消：交易完成状态之前 */
    public boolean cancellableBySeller() {
        return this != COMPLETED && this != CANCELED;
    }

    /** 商家可确认：必须先完成线上支付（挑战 C.1） */
    public boolean confirmable() {
        return this == PAID;
    }

    /** 是否仍在履约流程中 */
    public boolean active() {
        return this != COMPLETED && this != CANCELED;
    }
}
