package com.mall.entity.enums;

/**
 * 商家处理结果：与客户诉求分开，允许商家给出与申请不同的方案。
 */
public enum AfterSaleResult {
    RETURN_REFUND("同意退货退款", true),
    REFUND_ONLY("同意仅退款", true),
    EXCHANGE("同意换货", false),
    REPAIR("同意维修", false),
    REJECT("拒绝售后", false);

    private final String label;
    /** 是否产生退款 */
    private final boolean refund;

    AfterSaleResult(String label, boolean refund) {
        this.label = label;
        this.refund = refund;
    }

    public String getLabel() {
        return label;
    }

    public boolean refund() {
        return refund;
    }
}
