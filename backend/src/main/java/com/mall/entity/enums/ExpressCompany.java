package com.mall.entity.enums;

/**
 * 合作的快递物流服务商（挑战 C.2）：发货时由卖家选择，运单号由系统或卖家填写。
 * 仅作为运单归属标识，不调用任何快递公司开放平台接口。
 */
public enum ExpressCompany {
    SF("顺丰速运", "SF"),
    JD("京东物流", "JD"),
    ZTO("中通快递", "ZTO"),
    YTO("圆通速递", "YTO"),
    YUNDA("韵达速递", "YD"),
    STO("申通快递", "STO"),
    JTSD("极兔速递", "JT"),
    DBL("德邦快递", "DBL"),
    EMS("中国邮政EMS", "EMS");

    private final String label;
    /** 运单号前缀，用于生成模拟单号 */
    private final String prefix;

    ExpressCompany(String label, String prefix) {
        this.label = label;
        this.prefix = prefix;
    }

    public String getLabel() {
        return label;
    }

    public String getPrefix() {
        return prefix;
    }
}
