// 生成《第 4 次阶段性评审 · 讲述版》PPT
// 运行： node build-review4-ppt.js
const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "pingxixi 项目组";
pres.title = "第 4 次阶段性评审报告";

// ---------- 主题 ----------
const INK = "2B2622";
const CLAY = "B85042";
const CLAY_D = "8E3B33";
const SAND = "E7E8D1";
const CREAM = "FBF8F3";
const SAGE = "A7BEAE";
const MUTED = "8A8178";
const WHITE = "FFFFFF";
const DEEP = "4F6D7A";
const GOLD = "8A6F47";
const GREEN = "3F7A55";

const FT = "Microsoft YaHei";
const FB = "Microsoft YaHei";
const W = 10, H = 5.625;

const shadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.1 });
const img = (f) => path.join(__dirname, "docs", "wiki", "screenshots", f);

function pageNo(slide, n) {
  slide.addText(String(n), {
    x: 9.2, y: 5.05, w: 0.5, h: 0.28, fontFace: FB, fontSize: 9,
    color: MUTED, align: "right", valign: "middle", margin: 0,
  });
}

function header(slide, tag, title, sub, color = CLAY) {
  slide.background = { color: CREAM };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.09, fill: { color } });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 0.34, w: 1.05, h: 0.3, fill: { color } });
  slide.addText(tag, {
    x: 0.5, y: 0.34, w: 1.05, h: 0.3, fontFace: FB, fontSize: 10, bold: true,
    color: WHITE, align: "center", valign: "middle", margin: 0,
  });
  slide.addText(title, {
    x: 1.68, y: 0.28, w: 7.4, h: 0.44, fontFace: FT, fontSize: 21, bold: true,
    color: INK, align: "left", valign: "middle", margin: 0,
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.5, y: 0.76, w: 8.9, h: 0.3, fontFace: FB, fontSize: 10.5,
      color: MUTED, align: "left", valign: "middle", margin: 0,
    });
  }
}

function card(slide, x, y, w, h, color, title, lines, opt = {}) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h, fill: { color } });
  slide.addText(title, {
    x: x + 0.2, y: y + 0.1, w: w - 0.32, h: 0.3, fontFace: FB,
    fontSize: opt.titleSize || 12, bold: true, color: INK, valign: "middle", margin: 0,
  });
  if (lines && lines.length) {
    slide.addText(
      lines.map((t, i) => ({ text: t, options: { breakLine: i < lines.length - 1, bullet: { code: "2022" }, paraSpaceAfter: 3 } })),
      {
        x: x + 0.2, y: y + 0.42, w: w - 0.32, h: h - 0.54, fontFace: FB,
        fontSize: opt.bodySize || 9.5, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.1,
      }
    );
  }
}

function stat(slide, x, y, w, h, num, label, color) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow(),
  });
  slide.addText(num, {
    x, y: y + 0.05, w, h: 0.55, fontFace: FT, fontSize: 26, bold: true,
    color, align: "center", valign: "middle", margin: 0,
  });
  slide.addText(label, {
    x, y: y + 0.58, w, h: 0.28, fontFace: FB, fontSize: 9,
    color: MUTED, align: "center", valign: "middle", margin: 0,
  });
}

function table(slide, x, y, w, rows, colW, opt = {}) {
  slide.addTable(rows, {
    x, y, w, colW,
    fontFace: FB, fontSize: opt.size || 9, color: "4A423C",
    border: { type: "solid", color: "E3DDD4", pt: 0.75 },
    align: "left", valign: "middle", rowH: opt.rowH || 0.3,
    fill: { color: WHITE },
  });
}

function codeBox(slide, x, y, w, h, lines, opt = {}) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: "2B2622" }, line: { color: "2B2622", width: 1 },
  });
  slide.addText(
    lines.map((t, i) => ({
      text: t.text,
      options: { color: t.color || "D4D4D4", bold: !!t.bold, breakLine: i < lines.length - 1 },
    })),
    {
      x: x + 0.22, y: y + 0.12, w: w - 0.4, h: h - 0.24, fontFace: "Consolas",
      fontSize: opt.size || 10, valign: "top", margin: 0, lineSpacingMultiple: 1.25,
    }
  );
}

function shot(slide, file, x, y, w) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x - 0.04, y: y - 0.04, w: w + 0.08, h: w * 0.5625 + 0.08,
    fill: { color: WHITE }, line: { color: "D9D2C8", width: 1 }, shadow: shadow(),
  });
  slide.addImage({ path: img(file), x, y, w, h: w * 0.5625 });
}

// ================= P1 封面 =================
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.16, h: H, fill: { color: CLAY } });

  s.addText("第 4 次阶段性评审", {
    x: 0.74, y: 0.62, w: 6, h: 0.32, fontFace: FB, fontSize: 12, color: CLAY, bold: true, charSpacing: 2, margin: 0,
  });
  s.addText("订单闭环 · 商品预选", {
    x: 0.72, y: 1.02, w: 8.5, h: 0.78, fontFace: FT, fontSize: 38, bold: true, color: WHITE, margin: 0,
  });
  s.addText("在线购物系统（拼夕夕 PinXixi）· 挑战 B 首批能力落地", {
    x: 0.74, y: 1.84, w: 7.6, h: 0.36, fontFace: FB, fontSize: 15, color: "D9D2C8", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.74, y: 2.34, w: 1.2, h: 0.035, fill: { color: CLAY } });
  s.addText("B.1 订单升级：客户下单 → 商家确认 → 备货完成 → 开始发货 → 交易完成", {
    x: 0.74, y: 2.52, w: 8.3, h: 0.3, fontFace: FB, fontSize: 11, color: "B9B0A6", margin: 0,
  });
  s.addText("B.2 商品预选升级：收藏 · 购物车 · 多件合并下单 · 批量转收藏", {
    x: 0.74, y: 2.86, w: 8.3, h: 0.3, fontFace: FB, fontSize: 11, color: "B9B0A6", margin: 0,
  });

  s.addText("第 4 组 · 2026-11-09 · 提交 4d6085b", {
    x: 0.74, y: 4.62, w: 6.4, h: 0.3, fontFace: FB, fontSize: 10.5, color: "8F867E", margin: 0,
  });
  s.addText("汇报人：方浩昱", {
    x: 0.74, y: 4.94, w: 4, h: 0.3, fontFace: FB, fontSize: 10.5, color: "8F867E", margin: 0,
  });

  // 右侧装饰
  const tiles = [["7", "条挑战 B 需求"], ["23", "个新增接口"], ["3", "个新增页面"]];
  tiles.forEach((t, i) => {
    const y = 3.5 + i * 0.62;
    s.addShape(pres.shapes.RECTANGLE, { x: 7.25, y, w: 2.1, h: 0.5, fill: { color: "3A332E" }, line: { color: "4A423C", width: 1 } });
    s.addText(t[0], { x: 7.4, y, w: 0.6, h: 0.5, fontFace: FT, fontSize: 18, bold: true, color: CLAY, valign: "middle", margin: 0 });
    s.addText(t[1], { x: 8.02, y, w: 1.2, h: 0.5, fontFace: FB, fontSize: 9, color: "B9B0A6", valign: "middle", margin: 0 });
  });
}

// ================= P2 总览 =================
{
  const s = pres.addSlide();
  header(s, "总览", "本轮交付：7 条挑战 B 需求一次落地", "订单主链路 + 预选转化链路，前后端与文档同步交付", CLAY);
  pageNo(s, 2);

  stat(s, 0.5, 1.18, 2.1, 0.9, "7", "挑战 B 需求条目", CLAY);
  stat(s, 2.75, 1.18, 2.1, 0.9, "23", "新增接口", DEEP);
  stat(s, 5.0, 1.18, 2.1, 0.9, "4+1", "新增实体 / 状态枚举", GOLD);
  stat(s, 7.25, 1.18, 2.25, 0.9, "2196", "新增代码行（+2196 / −28）", SAGE);

  const rows = [
    [{ text: "需求", options: { bold: true } }, { text: "实现要点", options: { bold: true } }, { text: "状态", options: { bold: true } }],
    ["B.1-1 订单五状态", "PLACED → CONFIRMED → PREPARED → SHIPPED → COMPLETED，跨状态操作拒绝", "已完成"],
    ["B.1-2 客户取消", "开始发货前可取消；取消后库存回滚，订单置为 CANCELED", "已完成"],
    ["B.1-3 商家取消", "交易完成前可取消；记录取消方与原因，库存回滚", "已完成"],
    ["B.2-1 商品收藏", "收藏 / 取消收藏、数量与状态校验、收藏列表实时价格库存", "已完成"],
    ["B.2-2 加入购物车", "重复加入累加数量、数量受库存约束、可改数量与删除", "已完成"],
    ["B.2-3 多件合并下单", "勾选多件生成一个订单，明细逐条快照，下单扣库存并清空购物车", "已完成"],
    ["B.2-4 购物车转收藏", "勾选多件批量转收藏，已收藏不重复，转移后移出购物车", "已完成"],
  ];
  table(s, 0.5, 2.26, 9, rows, [1.95, 5.15, 1.9], { rowH: 0.3, size: 8.4 });

  s.addText("本轮提交 4d6085b：33 个文件，新增 4 个实体（Order / OrderItem / CartItem / Favorite）与 1 个订单状态枚举。", {
    x: 0.5, y: 4.9, w: 9, h: 0.28, fontFace: FB, fontSize: 9, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P3 订单状态机 =================
{
  const s = pres.addSlide();
  header(s, "B.1 订单", "五状态流转与两条取消规则", "状态只能按序推进；取消是唯一的分支出口", CLAY);
  pageNo(s, 3);

  const steps = [
    ["客户下单", "PLACED", CLAY],
    ["商家确认", "CONFIRMED", DEEP],
    ["备货完成", "PREPARED", DEEP],
    ["开始发货", "SHIPPED", GOLD],
    ["交易完成", "COMPLETED", GREEN],
  ];
  steps.forEach((st, i) => {
    const x = 0.5 + i * 1.87;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.3, w: 1.55, h: 0.82, fill: { color: WHITE }, line: { color: st[2], width: 1.5 }, shadow: shadow(), rectRadius: 0.08 });
    s.addText(st[0], { x, y: 1.38, w: 1.55, h: 0.32, fontFace: FB, fontSize: 11, bold: true, color: INK, align: "center", margin: 0 });
    s.addText(st[1], { x, y: 1.72, w: 1.55, h: 0.26, fontFace: "Consolas", fontSize: 8, color: MUTED, align: "center", margin: 0 });
    if (i < steps.length - 1) {
      s.addText("→", { x: x + 1.58, y: 1.5, w: 0.28, h: 0.3, fontFace: FB, fontSize: 15, color: MUTED, align: "center", valign: "middle", margin: 0 });
    }
  });

  // 客户取消窗口
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 2.5, w: 5.61, h: 0.52, fill: { color: "F3EFE7" }, line: { color: CLAY, width: 1 } });
  s.addText("客户可取消：开始发货之前", { x: 0.66, y: 2.55, w: 2.5, h: 0.26, fontFace: FB, fontSize: 10, bold: true, color: CLAY_D, margin: 0 });
  s.addText("客户下单 / 商家确认 / 备货完成 三个状态均可取消（含取消原因，可空）", {
    x: 0.66, y: 2.76, w: 5.3, h: 0.22, fontFace: FB, fontSize: 8, color: "5E554D", margin: 0,
  });

  // 商家取消窗口
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.16, w: 9.03, h: 0.52, fill: { color: "FAF7F2" }, line: { color: GOLD, width: 1 } });
  s.addText("商家可取消：交易完成之前", { x: 0.66, y: 3.21, w: 2.5, h: 0.26, fontFace: FB, fontSize: 10, bold: true, color: GOLD, margin: 0 });
  s.addText("客户下单 / 商家确认 / 备货完成 / 开始发货 四个状态均可取消；交易完成与已取消不可再操作", {
    x: 0.66, y: 3.42, w: 8.6, h: 0.22, fontFace: FB, fontSize: 8, color: "5E554D", margin: 0,
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.95, w: 9.03, h: 0.9, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
  s.addText("取消后发生什么", { x: 0.7, y: 4.02, w: 3, h: 0.26, fontFace: FB, fontSize: 10, bold: true, color: INK, margin: 0 });
  s.addText("订单置为 CANCELED 并记录取消方（CUSTOMER / SELLER）、取消原因与时间；按订单明细逐项回滚库存，库存由 0 恢复时同步恢复上架；销售数量仅在交易完成时累加。", {
    x: 0.7, y: 4.28, w: 8.6, h: 0.5, fontFace: FB, fontSize: 8.8, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.2,
  });
}

// ================= P4 订单后端设计 =================
{
  const s = pres.addSlide();
  header(s, "B.1 订单", "后端设计：一次事务完成下单与扣库存", "OrderService.checkoutFromCart + 状态机校验", DEEP);
  pageNo(s, 4);

  codeBox(s, 0.5, 1.2, 4.75, 1.9, [
    { text: "@Transactional", color: "9CDCFE", bold: true },
    { text: "checkoutFromCart(customerId, itemIds, ...)", color: "DCDCAA" },
    { text: "  1. 校验购物车条目归属当前客户", color: "B5CEA8" },
    { text: "  2. 逐项校验商品可购买 + 库存充足", color: "B5CEA8" },
    { text: "  3. 扣减库存，库存归零自动下架", color: "B5CEA8" },
    { text: "  4. 生成 Order + OrderItem 价格快照", color: "B5CEA8" },
    { text: "  5. 删除已下单的购物车条目", color: "B5CEA8" },
  ], { size: 9 });

  s.addText("数据模型（4 表）", { x: 5.5, y: 1.2, w: 3.9, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0 });
  const rows = [
    [{ text: "表 / 实体", options: { bold: true } }, { text: "关键字段", options: { bold: true } }],
    ["mall_order / Order", "orderNo、totalAmount、status、canceledBy"],
    ["order_item / OrderItem", "orderId、名称/单价快照、quantity"],
    ["cart_item / favorite", "customerId + productId 唯一"],
  ];
  table(s, 5.5, 1.5, 4.0, rows, [1.35, 2.65], { rowH: 0.36, size: 7.4 });

  card(s, 0.5, 3.28, 4.4, 1.35, CLAY, "并发与一致性", [
    "Product 保留 @Version 乐观锁，库存扣减随实体更新",
    "下单全程 @Transactional，任一步失败整体回滚",
    "明细保存价格与名称快照，卖家改价不影响历史订单",
  ], { bodySize: 8.6 });

  card(s, 5.1, 3.28, 4.43, 1.35, GOLD, "订单号与追溯", [
    "订单号 SO + 时间戳 + 4 位随机数，唯一约束兜底",
    "记录 createdAt / confirmedAt / preparedAt / shippedAt / completedAt",
    "取消记录 canceledAt / canceledBy / cancelReason，全链路可追溯",
  ], { bodySize: 8.6 });

  s.addText("设计取舍：下单即扣库存（而非发货时），保证「订单成立 = 库存已锁定」，与既有意向预占的库存口径一致。", {
    x: 0.5, y: 4.82, w: 9, h: 0.28, fontFace: FB, fontSize: 9, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P5 订单接口 =================
{
  const s = pres.addSlide();
  header(s, "B.1 订单", "接口一览与状态校验", "客户 3 个 + 卖家 7 个，全部受 token 保护", CLAY);
  pageNo(s, 5);

  const rows = [
    [{ text: "端", options: { bold: true } }, { text: "方法与路径", options: { bold: true } }, { text: "说明", options: { bold: true } }],
    ["客户", "GET /api/customer/orders", "订单列表（含明细、进度时间、可取消标记）"],
    ["客户", "GET /api/customer/orders/{id}", "订单详情（仅本人）"],
    ["客户", "POST /api/customer/orders/{id}/cancel", "取消订单（开始发货前）"],
    ["卖家", "GET /api/seller/orders", "订单列表（status 筛选 + 分页）"],
    ["卖家", "GET /api/seller/orders/{id}", "订单详情"],
    ["卖家", "POST /api/seller/orders/{id}/confirm", "确认订单：PLACED → CONFIRMED"],
    ["卖家", "POST /api/seller/orders/{id}/prepare", "备货完成：CONFIRMED → PREPARED"],
    ["卖家", "POST /api/seller/orders/{id}/ship", "开始发货：PREPARED → SHIPPED"],
    ["卖家", "POST /api/seller/orders/{id}/complete", "交易完成：SHIPPED → COMPLETED"],
    ["卖家", "POST /api/seller/orders/{id}/cancel", "取消订单（交易完成前）"],
  ];
  table(s, 0.5, 1.18, 5.75, rows, [0.62, 3.03, 2.1], { rowH: 0.31, size: 7.6 });

  s.addShape(pres.shapes.RECTANGLE, { x: 6.45, y: 1.18, w: 3.05, h: 3.5, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.45, y: 1.18, w: 3.05, h: 0.05, fill: { color: DEEP } });
  s.addText("状态校验规则", { x: 6.62, y: 1.3, w: 2.7, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0 });
  s.addText(
    [
      { text: "每个推进接口只接受唯一的前置状态", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 5 } },
      { text: "跨状态调用返回业务错误，不修改数据", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 5 } },
      { text: "客户取消：仅 PLACED / CONFIRMED / PREPARED", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 5 } },
      { text: "商家取消：除 COMPLETED / CANCELED 外均可", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 5 } },
      { text: "重复取消返回「已取消，无需重复操作」", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 5 } },
      { text: "客户只能访问自己的订单（findByIdAndCustomerId）", options: { bullet: { code: "2022" } } },
    ],
    { x: 6.62, y: 1.68, w: 2.7, h: 2.85, fontFace: FB, fontSize: 8.6, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.18 }
  );

  s.addText("鉴权：/api/customer/** 由 CustomerInterceptor 校验客户 token；/api/seller/** 由 AuthInterceptor 校验卖家 token。", {
    x: 0.5, y: 4.84, w: 9, h: 0.28, fontFace: FB, fontSize: 9, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P6 卖家订单管理页 =================
{
  const s = pres.addSlide();
  header(s, "B.1 订单", "卖家端：订单管理页（实拍）", "/seller/orders：状态筛选 + 按状态推进 + 详情进度", DEEP);
  pageNo(s, 6);

  shot(s, "18-seller-orders.png", 4.62, 1.16, 5.0);

  s.addText("页面能力", { x: 0.5, y: 1.16, w: 3.8, h: 0.3, fontFace: FB, fontSize: 12, bold: true, color: INK, margin: 0 });
  s.addText(
    [
      { text: "状态筛选：全部 / 五个状态 / 已取消，分页展示", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "按当前状态显示唯一「下一步」按钮，避免误操作", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "详情弹窗：五节点进度条 + 收货信息 + 明细与合计", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "取消订单弹窗填写原因，取消后库存自动回滚", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "列表直接展示件数、金额、下单时间与买家联系方式", options: { bullet: { code: "2022" } } },
    ],
    { x: 0.5, y: 1.55, w: 3.85, h: 2.6, fontFace: FB, fontSize: 9.2, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.2 }
  );

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.12, w: 3.9, h: 0.78, fill: { color: "FAF7F2" }, line: { color: SAGE, width: 1 } });
  s.addText("截图说明", { x: 0.66, y: 4.18, w: 2, h: 0.24, fontFace: FB, fontSize: 9, bold: true, color: GREEN, margin: 0 });
  s.addText("交易完成订单详情：五个节点全部点亮，商品为钱包 + 马克杯合并订单，合计 ¥258。", {
    x: 0.66, y: 4.42, w: 3.6, h: 0.42, fontFace: FB, fontSize: 8, color: "4A423C", valign: "top", margin: 0,
  });
}

// ================= P7 客户订单页 =================
{
  const s = pres.addSlide();
  header(s, "B.1 订单", "客户侧：订单页与取消入口（实拍）", "/customer/orders：状态筛选 + 展开进度 + 条件取消", CLAY);
  pageNo(s, 7);

  shot(s, "17-customer-orders.png", 0.5, 1.16, 5.35);

  s.addText("页面能力", { x: 6.2, y: 1.16, w: 3.3, h: 0.3, fontFace: FB, fontSize: 12, bold: true, color: INK, margin: 0 });
  s.addText(
    [
      { text: "状态页签覆盖五个状态 + 已取消", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "展开行展示五节点时间轴（客户下单 → 交易完成）", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "取消按钮仅在前三个状态出现，其余不展示", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "取消需二次确认并可填原因，成功后刷新库存与状态", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "已取消订单显示取消方与原因，保留完整明细", options: { bullet: { code: "2022" } } },
    ],
    { x: 6.2, y: 1.55, w: 3.35, h: 2.6, fontFace: FB, fontSize: 9.2, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.2 }
  );

  s.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: 4.12, w: 3.35, h: 0.78, fill: { color: "FAF7F2" }, line: { color: CLAY, width: 1 } });
  s.addText("截图说明", { x: 6.35, y: 4.18, w: 2, h: 0.24, fontFace: FB, fontSize: 9, bold: true, color: CLAY_D, margin: 0 });
  s.addText("同一客户三笔订单并存：客户下单、已取消、交易完成，展开项显示完整进度与明细。", {
    x: 6.35, y: 4.42, w: 3.1, h: 0.42, fontFace: FB, fontSize: 8, color: "4A423C", valign: "top", margin: 0,
  });
}

// ================= P8 收藏 =================
{
  const s = pres.addSlide();
  header(s, "B.2 预选", "收藏：把「想买」沉淀下来（实拍）", "/favorites：收藏列表 + 一键加购 + 取消收藏", GOLD);
  pageNo(s, 8);

  shot(s, "16-favorites.png", 5.0, 1.16, 4.5);

  s.addText("能力与规则", { x: 0.5, y: 1.16, w: 4.25, h: 0.3, fontFace: FB, fontSize: 12, bold: true, color: INK, margin: 0 });
  s.addText(
    [
      { text: "唯一约束 (customerId, productId)，重复收藏不新增", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "收藏列表实时回显商品价格、库存与可购买状态", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "商品不可购买时『加入购物车』置灰，仍可取消收藏", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "商品详情页支持收藏 / 已收藏切换，状态即时回写", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "首页商品卡提供快捷收藏入口", options: { bullet: { code: "2022" } } },
    ],
    { x: 0.5, y: 1.55, w: 4.2, h: 2.6, fontFace: FB, fontSize: 9.2, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.2 }
  );

  codeBox(s, 0.5, 4.15, 4.2, 0.78, [
    { text: "GET    /api/customer/favorites", color: "9CDCFE" },
    { text: "POST   /api/customer/favorites   { productId }", color: "B5CEA8" },
    { text: "DELETE /api/customer/favorites/{productId}", color: "CE9178" },
  ], { size: 8 });

  s.addText("设计要点：收藏只保存关联关系，展示时联表读取商品实时数据，避免商品改价后收藏页显示过期价格。", {
    x: 5.0, y: 4.2, w: 4.55, h: 0.52, fontFace: FB, fontSize: 8.6, color: MUTED, italic: true, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
  });
}

// ================= P9 购物车与多件下单 =================
{
  const s = pres.addSlide();
  header(s, "B.2 预选", "购物车：勾选多件，合并成一单（实拍）", "/cart：多选 → 结算 → 生成一个订单", CLAY);
  pageNo(s, 9);

  shot(s, "15-cart.png", 0.5, 1.16, 5.35);

  s.addText("关键交互", { x: 6.2, y: 1.16, w: 3.3, h: 0.3, fontFace: FB, fontSize: 12, bold: true, color: INK, margin: 0 });
  s.addText(
    [
      { text: "勾选多件商品，底部实时汇总件数与金额", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "数量步进器即时校验库存，超库存直接拒绝", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "结算弹窗默认带出客户资料，可改收货人与地点", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "提交后生成 1 个订单 + N 条明细，返回订单号", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 6 } },
      { text: "对应购物车条目清空，跳转「我的订单」", options: { bullet: { code: "2022" } } },
    ],
    { x: 6.2, y: 1.55, w: 3.35, h: 2.6, fontFace: FB, fontSize: 9.2, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.2 }
  );

  s.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: 4.12, w: 3.35, h: 0.82, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
  s.addText("实测：2 件商品 → 1 个订单 ¥258.00，订单明细 2 条，购物车清空，库存分别 5→4 / 10→9。", {
    x: 6.35, y: 4.2, w: 3.1, h: 0.66, fontFace: FB, fontSize: 8.4, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.2,
  });
}

// ================= P10 批量转收藏 =================
{
  const s = pres.addSlide();
  header(s, "B.2 预选", "批量转收藏：购物车与收藏之间的通道", "勾选多条 → 写入收藏 → 移出购物车", DEEP);
  pageNo(s, 10);

  // 流程
  const flow = [
    ["① 勾选购物车条目", "支持一次多选"],
    ["② 校验归属与收藏状态", "已收藏则跳过创建"],
    ["③ 写入 Favorite", "唯一约束防重复"],
    ["④ 删除购物车条目", "同一事务完成"],
  ];
  flow.forEach((f, i) => {
    const x = 0.5 + i * 2.06;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.2, w: 1.82, h: 0.78, fill: { color: WHITE }, line: { color: GOLD, width: 1.2 }, rectRadius: 0.06, shadow: shadow() });
    s.addText(f[0], { x, y: 1.27, w: 1.82, h: 0.28, fontFace: FB, fontSize: 9, bold: true, color: INK, align: "center", margin: 0 });
    s.addText(f[1], { x, y: 1.55, w: 1.82, h: 0.3, fontFace: FB, fontSize: 7.5, color: MUTED, align: "center", margin: 0 });
    if (i < flow.length - 1) {
      s.addText("→", { x: x + 1.82, y: 1.4, w: 0.24, h: 0.3, fontFace: FB, fontSize: 14, color: MUTED, align: "center", valign: "middle", margin: 0 });
    }
  });

  codeBox(s, 0.5, 2.28, 4.6, 1.55, [
    { text: "POST /api/customer/cart/to-favorites", color: "9CDCFE", bold: true },
    { text: "Body: { itemIds: [12, 13, 14] }", color: "CE9178" },
    { text: "// 返回成功转移条数", color: "6A9955" },
    { text: "→ 3", color: "B5CEA8", bold: true },
  ], { size: 9.5 });

  const rows = [
    [{ text: "边界场景", options: { bold: true } }, { text: "处理", options: { bold: true } }],
    ["未勾选任何条目", "返回「请选择要转为收藏的商品」"],
    ["商品此前已收藏", "跳过创建，仍把购物车条目移除"],
    ["条目不属于当前客户", "查不到记录，返回业务错误"],
  ];
  table(s, 5.3, 2.28, 4.2, rows, [1.55, 2.65], { rowH: 0.42, size: 8.2 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.02, w: 9, h: 0.85, fill: { color: "FAF7F2" }, line: { color: SAGE, width: 1 } });
  s.addText("与多件下单的关系", { x: 0.68, y: 4.08, w: 3, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: GREEN, margin: 0 });
  s.addText("两条通道共用同一套勾选结果：现在买 → 合并下单；以后再买 → 批量转收藏。购物车条目在任一通道完成后都会被移除，避免重复下单。", {
    x: 0.68, y: 4.34, w: 8.6, h: 0.44, fontFace: FB, fontSize: 8.8, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.2,
  });
}

// ================= P11 验证证据 =================
{
  const s = pres.addSlide();
  header(s, "验证", "验证证据：接口实测 + 构建 + 浏览器走查", "2026-11-09 本地全链路回归", DEEP);
  pageNo(s, 11);

  const rows = [
    [{ text: "验证项", options: { bold: true } }, { text: "结论", options: { bold: true } }, { text: "证据", options: { bold: true } }],
    ["多件合并下单", "通过", "2 件商品 → 1 单 ¥258.00，明细 2 条，购物车清空"],
    ["五状态推进", "通过", "confirm → prepare → ship → complete 逐级成功，历史订单不可再取消"],
    ["开始发货后客户取消", "被拒绝", "返回「订单已开始发货，无法取消」，状态保持 SHIPPED"],
    ["客户取消库存回滚", "通过", "订单取消后商品库存 0 → 1，状态恢复在售"],
    ["商家取消与原因", "通过", "交易完成前取消成功，canceledBy=SELLER，库存回滚"],
    ["批量转收藏", "通过", "2 条购物车转收藏，收藏总数 2，购物车清零"],
    ["鉴权", "通过", "未带客户 token 访问 /api/customer/** 返回 HTTP 401"],
    ["构建与页面走查", "通过", "后端 package、前端 build 成功；四个新页面无控制台错误"],
  ];
  table(s, 0.5, 1.18, 9, rows, [2.3, 1.25, 5.45], { rowH: 0.3, size: 8.2 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.35, w: 9, h: 0.62, fill: { color: "F3EFE7" }, line: { color: SAGE, width: 1 } });
  s.addText("回归口径：本轮以 v0.3.0（3d8bf45）为基线，在其上 rebase 交付 4d6085b，原有挑战 A 与意向排队能力未回归失败。", {
    x: 0.68, y: 4.44, w: 8.6, h: 0.44, fontFace: FB, fontSize: 9, color: "4A423C", valign: "middle", margin: 0,
  });
}

// ================= P12 分工与结论 =================
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.16, h: H, fill: { color: CLAY } });
  s.addText("分工与评审结论", { x: 0.74, y: 0.36, w: 6, h: 0.46, fontFace: FT, fontSize: 23, bold: true, color: WHITE, margin: 0 });
  s.addText("第 4 次阶段性评审 · 2026-11-09 · 4d6085b", { x: 0.76, y: 0.86, w: 6, h: 0.28, fontFace: FB, fontSize: 10, color: "A79E96", margin: 0 });

  const rows = [
    [{ text: "成员", options: { bold: true, color: WHITE } }, { text: "本轮承担", options: { bold: true, color: WHITE } }],
    ["方浩昱（后端②）", "订单状态机与取消规则、库存回滚、购物车/收藏服务、多件下单事务、接口实测"],
    ["王则凯（后端①）", "订单/明细/购物车/收藏数据模型与 Repository、订单号规则、卖家订单分页"],
    ["丁月诚（前端）", "购物车页、收藏页、客户订单页重构、卖家订单页、入口与路由菜单"],
    ["戴英杰（测试）", "B.1 状态边界（发货后/完成后禁取消）、B.2 预选链路实测与界面走查"],
    ["何易（文档/组长）", "需求对齐、评审报告与讲述版 PPT、Wiki 与 README 同步"],
  ];
  s.addTable(rows, {
    x: 0.74, y: 1.24, w: 8.5, colW: [1.7, 6.8], fontFace: FB, fontSize: 7.7,
    color: "D9D2C8", border: { type: "solid", color: "4A423C", pt: 0.75 },
    fill: { color: "3A332E" }, rowH: 0.34, valign: "middle",
  });

  const items = [
    ["挑战 B 首批 7 条需求全部落地", "订单五状态、双向取消、收藏、购物车、多件下单、批量转收藏均实测通过。"],
    ["订单与既有能力解耦", "意向排队保留用于线下交易；新订单链路独立建表，互不干扰。"],
    ["下一迭代", "补充订单收货地址簿、发货物流信息与取消原因统计；同步需求说明书与测试用例。"],
  ];
  items.forEach((it, i) => {
    const y = 3.5 + i * 0.58;
    s.addText(String(i + 1), { x: 0.76, y, w: 0.35, h: 0.32, fontFace: FT, fontSize: 15, bold: true, color: CLAY, margin: 0 });
    s.addText(it[0], { x: 1.15, y: y - 0.02, w: 7.9, h: 0.26, fontFace: FB, fontSize: 10.5, bold: true, color: WHITE, margin: 0 });
    s.addText(it[1], { x: 1.15, y: y + 0.22, w: 7.9, h: 0.3, fontFace: FB, fontSize: 8.2, color: "B9B0A6", margin: 0 });
  });
}

const out = path.join(__dirname, "docs", "media", "第四周_第四次评审_讲述版.pptx");
pres.writeFile({ fileName: out }).then(() => {
  console.log("PPT 已生成：" + out);
});
