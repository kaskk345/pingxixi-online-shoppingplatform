package com.mall.entity.enums;

/**
 * 物流状态（挑战 C.2）：由系统在卖家发货 / 更新物流时维护，买家只读。
 * 与订单状态解耦：订单仍停在「开始发货」，物流状态独立推进到已签收。
 */
public enum LogisticsStatus {
    COLLECTED("已揽收"),
    IN_TRANSIT("运输中"),
    DELIVERING("派送中"),
    SIGNED("已签收"),
    EXCEPTION("物流异常");

    private final String label;

    LogisticsStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    /** 下一档状态：已揽收 -> 运输中 -> 派送中 -> 已签收 */
    public LogisticsStatus next() {
        return switch (this) {
            case COLLECTED -> IN_TRANSIT;
            case IN_TRANSIT -> DELIVERING;
            case DELIVERING, EXCEPTION -> SIGNED;
            case SIGNED -> SIGNED;
        };
    }

    public boolean finished() {
        return this == SIGNED;
    }
}
