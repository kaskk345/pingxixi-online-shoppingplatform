package com.mall.entity.enums;

/**
 * 购买意向状态：
 * 先到先得，按排队时间正序；等候中的意向按队列顺序依次递补进交易。
 */
public enum IntentStatus {
    WAITING("等候中"),
    TRADING("交易中"),
    SUCCEEDED("交易成功"),
    FAILED("交易失败"),
    VOID("已作废"),
    CANCELED("已撤销");

    private final String label;

    IntentStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    /** 是否还在队列中占位（等候中或交易中） */
    public boolean active() {
        return this == WAITING || this == TRADING;
    }
}
