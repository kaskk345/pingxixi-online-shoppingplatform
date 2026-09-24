package com.mall.entity.enums;

public enum IntentStatus {
    PENDING("待处理"),
    ACCEPTED("交易中"),
    SUCCEEDED("已成交"),
    FAILED("交易失败"),
    REJECTED("已拒绝"),
    EXPIRED("已失效");

    private final String label;

    IntentStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
