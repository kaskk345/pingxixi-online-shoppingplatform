package com.mall.entity.enums;

/**
 * 商品状态机（四态）：
 *   在售 --(排第一位进入交易 / 卖家手动冻结)--> 已冻结
 *   已冻结 --(交易成功)--> 已下架
 *   已冻结 --(交易失败)--> 已恢复在售
 *   已冻结 --(卖家解冻)--> 在售
 *   在售 / 已恢复在售 --(卖家手动下架)--> 已下架
 *
 * 说明：
 * 1. 卖家发布商品后直接是「在售」，没有单独的「上架」状态；
 * 2. 「已下架」是终态（交易成功或手动下架），不可再回到在售；
 * 3. 「在售」与「已恢复在售」都可被购买、都可提交意向；
 * 4. 单品单卖：可购买状态的商品同一时刻最多一件。
 */
public enum ProductStatus {
    ON_SALE("在售"),
    FROZEN("已冻结"),
    OFF_SHELF("已下架"),
    RESTORED("已恢复在售");

    private final String label;

    ProductStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    /** 是否处于可被购买 / 可提交意向的状态 */
    public boolean buyable() {
        return this == ON_SALE || this == RESTORED;
    }
}
