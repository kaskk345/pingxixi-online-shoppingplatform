package com.mall.entity.enums;

/**
 * 售后单状态机（独立于订单状态机）：
 *
 *   提交申请 -> 待处理 --(商家回复)--> 协商中 --(商家给出结果)--> 退货中 / 已完成 / 已拒绝
 *   待处理 / 协商中 --(客户撤销)--> 已撤销
 *   退货中 --(商家确认收到退货)--> 已完成
 */
public enum AfterSaleStatus {
    PENDING("待处理"),
    NEGOTIATING("协商中"),
    RETURNING("退货中"),
    COMPLETED("已完成"),
    REJECTED("已拒绝"),
    CANCELED("已撤销");

    private final String label;

    AfterSaleStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    /** 进行中：同一订单项不允许并存 */
    public boolean active() {
        return this == PENDING || this == NEGOTIATING || this == RETURNING;
    }

    /** 客户可撤销：商家给出结果前 */
    public boolean cancellable() {
        return this == PENDING || this == NEGOTIATING;
    }
}
