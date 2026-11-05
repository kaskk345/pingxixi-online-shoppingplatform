// 生成《第 3 次阶段性评审 · 讲述版》PPT
// 运行： $env:NODE_PATH="D:\nodejs\npm-global\node_modules"; node build-review3-ppt.js
const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "pingxixi 项目组";
pres.title = "第 3 次阶段性评审报告";

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

const FT = "Microsoft YaHei";
const FB = "Microsoft YaHei";
const W = 10, H = 5.625;

const shadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.1 });

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

// ================= P1 封面 =================
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.16, h: H, fill: { color: CLAY } });
  s.addText("第 3 次阶段性评审", {
    x: 1.0, y: 1.5, w: 8, h: 0.9, fontFace: FT, fontSize: 42, bold: true, color: WHITE, margin: 0,
  });
  s.addText("交易历史 · 分类管理 · 库存预占与文档一致性", {
    x: 1.02, y: 2.5, w: 8, h: 0.45, fontFace: FB, fontSize: 15, color: SAND, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 1.02, y: 3.2, w: 1.6, h: 0.04, fill: { color: CLAY } });
  s.addText("2026-11-05 · pingxixi 开发组（第 4 组）", {
    x: 1.02, y: 3.45, w: 6.5, h: 0.35, fontFace: FB, fontSize: 12, color: "A79E96", margin: 0,
  });
  s.addText("评审基准 v0.2.0（43073a6） · 评审对象为其后的 5 次增量提交", {
    x: 1.02, y: 3.82, w: 7.5, h: 0.32, fontFace: FB, fontSize: 10.5, color: "8A8178", margin: 0,
  });
  s.addText("仓库：github.com/kaskk345/pingxixi-online-shoppingplatform", {
    x: 1.02, y: 4.55, w: 8, h: 0.3, fontFace: FB, fontSize: 9.5, color: "6E665F", margin: 0,
  });
}

// ================= P2 概览 =================
{
  const s = pres.addSlide();
  header(s, "概览", "本次评审的两个重点", "基准是 v0.2.0（43073a6），不重新验收已确认内容", CLAY);
  pageNo(s, 2);

  const y = 1.2, h = 1.62, cw = 2.9;
  card(s, 0.5, y, cw, h, CLAY, "重点一 · 卖家端能力补齐", [
    "按商品查看完整交易历史",
    "含终态：成功 / 失败 / 作废 / 撤销",
    "分类管理补齐改名与删除",
  ]);
  card(s, 3.55, y, cw, h, DEEP, "重点二 · 健壮性与一致性", [
    "库存预占与超卖防护复核",
    "拒绝提示按商品状态分流",
    "四份文档对齐当前实现",
  ]);
  card(s, 6.6, y, cw, h, GOLD, "本轮结论", [
    "6 项目标达成 5 项",
    "1 项（数据看板）顺延",
    "A.1-02 由部分满足转为满足",
  ]);

  const sy = 3.02, sh = 0.92, sw = 2.1;
  stat(s, 0.5, sy, sw, sh, "5", "次增量提交", CLAY);
  stat(s, 2.75, sy, sw, sh, "21", "个文件变更", DEEP);
  stat(s, 5.0, sy, sw, sh, "+643", "行净增（−51）", GOLD);
  stat(s, 7.25, sy, sw, sh, "14", "项挑战升级用例", SAGE);

  s.addText("注：交易历史与分类管理为 v0.2.0 交付之后的增量内容，交付口径仍为 v0.2.0（43073a6）。", {
    x: 0.5, y: 4.15, w: 9, h: 0.3, fontFace: FB, fontSize: 9, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P3 时间线 =================
{
  const s = pres.addSlide();
  header(s, "状态", "当前迭代状态", "Sprint 1 已完结 → 挑战 A 落地 → v0.2.0 交付 → 本轮增量补齐", CLAY);
  pageNo(s, 3);

  s.addShape(pres.shapes.RECTANGLE, { x: 0.72, y: 2.22, w: 8.6, h: 0.025, fill: { color: "D9D2C8" } });

  const nodes = [
    { d: "09-28 ~ 10-09", t: "Sprint 1", c: "单品单卖闭环交付", k: MUTED },
    { d: "10-22", t: "挑战 A 落地", c: "A.1 / A.2（4f2fde7）", k: DEEP },
    { d: "10-29", t: "v0.2.0 交付", c: "库存预占（43073a6）", k: DEEP },
    { d: "10-29", t: "交易历史 + 提示", c: "7c9b48c / 51a2169", k: CLAY },
    { d: "11-04", t: "分类管理 + 文档", c: "f348b19 / 53801c5", k: CLAY },
    { d: "11-05", t: "本次评审", c: "回归 + 证据留存", k: GOLD },
  ];
  const nw = 1.42, gap = 0.06, startX = 0.5;
  nodes.forEach((n, i) => {
    const x = startX + i * (nw + gap);
    s.addShape(pres.shapes.OVAL, { x: x + nw / 2 - 0.075, y: 2.15, w: 0.15, h: 0.15, fill: { color: n.k } });
    s.addText(n.d, { x, y: 1.52, w: nw, h: 0.24, fontFace: FB, fontSize: 8.5, color: MUTED, align: "center", margin: 0 });
    s.addText(n.t, { x, y: 1.76, w: nw, h: 0.28, fontFace: FB, fontSize: 10, bold: true, color: INK, align: "center", margin: 0 });
    s.addText(n.c, { x, y: 2.42, w: nw, h: 0.46, fontFace: FB, fontSize: 8, color: "5E554D", align: "center", margin: 0, valign: "top" });
  });

  s.addText("当前系统状态", {
    x: 0.5, y: 3.05, w: 3, h: 0.3, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0,
  });

  const boxes = [
    { t: "多商品", d: "取消单品单卖", c: DEEP },
    { t: "客户账号", d: "注册 / 历史下单", c: DEEP },
    { t: "库存预占", d: "提交即占位", c: CLAY },
    { t: "交易历史", d: "按商品回溯", c: CLAY },
    { t: "分类管理", d: "增删改全具备", c: CLAY },
  ];
  boxes.forEach((b, i) => {
    const x = 0.5 + i * 1.84;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 3.42, w: 1.72, h: 0.92, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 3.42, w: 1.72, h: 0.045, fill: { color: b.c } });
    s.addText(b.t, { x, y: 3.55, w: 1.72, h: 0.3, fontFace: FB, fontSize: 11, bold: true, color: INK, align: "center", margin: 0 });
    s.addText(b.d, { x, y: 3.86, w: 1.72, h: 0.3, fontFace: FB, fontSize: 8.5, color: MUTED, align: "center", margin: 0 });
  });

  s.addText("课程挑战 A.1 的五条验收要求（多商品、2 级分类、库存归零自动下架、浏览 + 搜索、多图富媒体）在代码与运行态上均已具备对应实现。", {
    x: 0.5, y: 4.5, w: 9, h: 0.35, fontFace: FB, fontSize: 9, color: "4A423C", margin: 0, valign: "top",
  });
}

// ================= P4 目标达成 =================
{
  const s = pres.addSlide();
  header(s, "对照", "本轮 6 项目标的达成情况", "按《产品订单》Sprint 2 计划与第二次评审遗留项双向对照", CLAY);
  pageNo(s, 4);

  const rows = [
    [{ text: "#", options: { bold: true } }, { text: "目标", options: { bold: true } }, { text: "来源", options: { bold: true } }, { text: "状态", options: { bold: true } }, { text: "验证证据", options: { bold: true } }],
    ["1", "交易全链路可追溯（按商品看全部意向）", "Sprint 2 计划", "已达成", "TC-A1-08；截图 13；实测 4 条"],
    ["2", "库存超卖防护（预占 → 落定 / 释放）", "二次评审遗留", "已达成", "43073a6；行锁；库存 5→4→3"],
    ["3", "分类可维护（新增 / 改名 / 删除）", "A.1-02 验收", "已达成", "TC-A1-07；截图 14"],
    ["4", "拒绝提示按商品状态区分", "二次评审遗留", "已达成", "51a2169；三类文案"],
    ["5", "文档与实现一致", "二次评审遗留", "已达成", "53801c5；四份文档"],
    ["6", "卖家数据统计看板（前端接入）", "Sprint 2 计划", "未达成·顺延", "后端 stats 已就绪，前端未接"],
  ];
  table(s, 0.5, 1.2, 9, rows, [0.35, 3.15, 1.55, 1.05, 2.9], { rowH: 0.42, size: 8.8 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.28, w: 9, h: 0.62, fill: { color: "F3EFE7" }, line: { color: SAGE, width: 0.75 } });
  s.addText("结论：6 项中 5 项达成、1 项顺延。顺延项为纯前端接入，后端接口已就绪，不阻塞交易闭环与挑战 A.1 验收。", {
    x: 0.72, y: 4.36, w: 8.6, h: 0.46, fontFace: FB, fontSize: 10, color: INK, valign: "middle", margin: 0,
  });
}

// ================= P5 交易历史·缺口 =================
{
  const s = pres.addSlide();
  header(s, "交易历史", "为什么做：卖家看不到「按商品」的交易履历", "需求规格 FR-06-02 要求以商品为单位归档全部意向流水", CLAY);
  pageNo(s, 5);

  card(s, 0.5, 1.2, 4.4, 1.42, "9A8C7E", "改造前", [
    "只有全局意向列表，需人工按商品翻找",
    "商品下架后，其历史记录无法按商品回溯",
    "已结束记录与进行中记录混在一起",
  ], { bodySize: 9 });
  card(s, 5.1, 1.2, 4.4, 1.42, CLAY, "改造后", [
    "商品行内「历史」入口，一键进入该商品全部记录",
    "终态订单保留，可按「已结束」单独筛选",
    "匿名买家与注册客户分列，统计卡直接给出分布",
  ], { bodySize: 9 });

  const rows = [
    [{ text: "卖家要回答的问题", options: { bold: true } }, { text: "改造前", options: { bold: true } }, { text: "改造后", options: { bold: true } }],
    ["这件商品卖给了谁、成交几条", "翻全局列表人工比对", "统计卡 + 商品维度流水"],
    ["为什么这个人没成交", "只看到「已作废」，不知归属", "按商品聚合，含终态与结果标签"],
    ["下单人是老客户还是访客", "仅有姓名与电话", "买家来源列 + 客户账号列"],
  ];
  table(s, 0.5, 2.82, 9, rows, [3.7, 2.6, 2.7], { rowH: 0.36, size: 9 });

  s.addText("设计取舍：历史记录不返回买家口令码，与卖家侧不泄露口令码的既有规则（TC-12）保持一致。", {
    x: 0.5, y: 4.42, w: 9, h: 0.3, fontFace: FB, fontSize: 9, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P6 交易历史·接口 =================
{
  const s = pres.addSlide();
  header(s, "交易历史", "接口与数据结构", "GET /api/seller/products/{id}/history", CLAY);
  pageNo(s, 6);

  codeBox(s, 0.5, 1.2, 5.3, 1.36, [
    { text: "GET /api/seller/products/{id}/history", color: "9CDCFE", bold: true },
    { text: "Header: X-Token  (/api/seller/** 拦截)", color: "CE9178" },
    { text: "Response: Result<List<SellerIntentView>>", color: "B5CEA8" },
    { text: "// 按 queueTime 升序，含全部终态", color: "6A9955" },
  ], { size: 9.5 });

  s.addText("SellerIntentView 字段（12 个）", {
    x: 0.5, y: 2.72, w: 4, h: 0.3, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0,
  });

  const fRows = [
    [{ text: "字段", options: { bold: true } }, { text: "说明", options: { bold: true } }],
    ["id / productId", "记录号与所属商品"],
    ["buyerName / buyerPhone", "买家姓名、联系电话"],
    ["customerId", "为空即匿名买家"],
    ["customerUsername", "注册客户账号（反查 Customer）"],
    ["status / statusLabel", "枚举值 + 中文标签"],
    ["result / resultLabel", "终态结果，可能为 null"],
    ["queueTime / createdAt", "排队时间、提交时间"],
  ];
  table(s, 0.5, 3.05, 5.3, fRows, [2.1, 3.2], { rowH: 0.26, size: 8.4 });

  s.addShape(pres.shapes.RECTANGLE, { x: 6.05, y: 1.2, w: 3.45, h: 3.75, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.05, y: 1.2, w: 3.45, h: 0.05, fill: { color: DEEP } });
  s.addText("实现要点", { x: 6.25, y: 1.34, w: 3.1, h: 0.3, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0 });
  s.addText(
    [
      { text: "IntentService.historyByProduct 聚合", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 5 } },
      { text: "customerId 为 null → 匿名分支", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 5 } },
      { text: "非空时反查 Customer.username 填充", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 5 } },
      { text: "复用 AuthInterceptor，无需新拦截器", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 5 } },
      { text: "页面同时拉取商品详情与历史（Promise.all）", options: { bullet: { code: "2022" } } },
    ],
    { x: 6.25, y: 1.75, w: 3.05, h: 3.0, fontFace: FB, fontSize: 9, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.15 }
  );
}

// ================= P7 交易历史·页面与实测 =================
{
  const s = pres.addSlide();
  header(s, "交易历史", "页面结构与实测证据", "4 个统计卡 + 三段筛选 + 8 列流水，只读", CLAY);
  pageNo(s, 7);

  const bx = 0.5, bw = 5.5;
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: 1.18, w: bw, h: 3.2, fill: { color: WHITE }, line: { color: "D9D2C8", width: 1 } });
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: 1.18, w: bw, h: 0.34, fill: { color: "F3EFE7" } });
  s.addText("‹ 返回商品列表", { x: bx + 0.12, y: 1.22, w: 1.3, h: 0.26, fontFace: FB, fontSize: 7.5, color: "5E554D", margin: 0 });
  s.addText("手工牛皮钱包 · 限量定制", { x: bx + 1.5, y: 1.21, w: 2.6, h: 0.28, fontFace: FB, fontSize: 9, bold: true, color: INK, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: bx + bw - 0.78, y: 1.24, w: 0.62, h: 0.22, fill: { color: "E8F3EC" }, line: { color: "A7BEAE", width: 0.5 } });
  s.addText("在售", { x: bx + bw - 0.78, y: 1.24, w: 0.62, h: 0.22, fontFace: FB, fontSize: 7, color: "3F7A55", align: "center", valign: "middle", margin: 0 });

  const metas = ["价格 ¥199", "库存 3", "销量 1", "分类 服饰/配饰"];
  metas.forEach((m, i) => {
    const x = bx + 0.12 + i * 1.33;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.62, w: 1.26, h: 0.26, fill: { color: "FAF7F2" }, line: { color: "E3DDD4", width: 0.5 } });
    s.addText(m, { x, y: 1.62, w: 1.26, h: 0.26, fontFace: FB, fontSize: 7, color: "4A423C", align: "center", valign: "middle", margin: 0 });
  });

  const stats = [["4", "全部记录"], ["1", "交易成功"], ["1", "进行中"], ["3", "匿名买家"]];
  stats.forEach((st, i) => {
    const x = bx + 0.12 + i * 1.33;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 1.26, h: 0.52, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.5 } });
    s.addText(st[0], { x, y: 2.02, w: 1.26, h: 0.28, fontFace: FT, fontSize: 13, bold: true, color: "2F6FD0", align: "center", margin: 0 });
    s.addText(st[1], { x, y: 2.28, w: 1.26, h: 0.2, fontFace: FB, fontSize: 6.5, color: MUTED, align: "center", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: bx + 0.12, y: 2.62, w: 0.5, h: 0.22, fill: { color: "2F6FD0" } });
  s.addText("全部", { x: bx + 0.12, y: 2.62, w: 0.5, h: 0.22, fontFace: FB, fontSize: 6.5, color: WHITE, align: "center", valign: "middle", margin: 0 });
  s.addText("进行中   已结束", { x: bx + 0.66, y: 2.62, w: 1.5, h: 0.22, fontFace: FB, fontSize: 6.5, color: "5E554D", valign: "middle", margin: 0 });

  const cols = ["编号", "姓名", "电话", "来源", "账号", "状态", "结果", "排队时间"];
  const cw = [0.52, 0.62, 0.82, 0.72, 0.66, 0.62, 0.58, 0.86];
  let cx = bx + 0.12;
  cols.forEach((c, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 2.92, w: cw[i], h: 0.24, fill: { color: "F3EFE7" }, line: { color: "E3DDD4", width: 0.5 } });
    s.addText(c, { x: cx, y: 2.92, w: cw[i], h: 0.24, fontFace: FB, fontSize: 6.5, color: "5E554D", align: "center", valign: "middle", margin: 0 });
    cx += cw[i];
  });
  const data = [
    ["1", "张伟", "138****0002", "匿名", "—", "成功", "成功"],
    ["2", "buyer1", "138****0001", "注册客户", "buyer1", "作废", "—"],
    ["3", "李娜", "138****0003", "匿名", "—", "作废", "—"],
    ["4", "王强", "138****0004", "匿名", "—", "等候中", "—"],
  ];
  data.forEach((r, ri) => {
    let x = bx + 0.12;
    const y = 3.16 + ri * 0.28;
    r.forEach((v, i) => {
      const isStatus = i === 5;
      const color = isStatus ? (v === "成功" ? "3F7A55" : v === "等候中" ? "B8860B" : "8A8178") : "4A423C";
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw[i], h: 0.28, fill: { color: WHITE }, line: { color: "EDE7DE", width: 0.5 } });
      s.addText(v, { x, y, w: cw[i], h: 0.28, fontFace: FB, fontSize: 6.2, color, align: "center", valign: "middle", margin: 0 });
      x += cw[i];
    });
  });
  s.addText("※ 上图为页面结构示意，实际界面见截图 13", { x: bx, y: 4.42, w: bw, h: 0.24, fontFace: FB, fontSize: 7, color: MUTED, italic: true, margin: 0 });

  s.addText("实测数据（2026-11-05）", { x: 6.2, y: 1.18, w: 3.3, h: 0.3, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0 });
  const tRows = [
    [{ text: "项", options: { bold: true } }, { text: "值", options: { bold: true } }],
    ["商品状态", "ON_SALE（在售）"],
    ["库存 / 销量", "3 / 1"],
    ["历史记录", "4 条"],
    ["状态分布", "成功 1 · 作废 2 · 等候 1"],
    ["匿名占比", "3 / 4"],
  ];
  table(s, 6.2, 1.52, 3.3, tRows, [1.15, 2.15], { rowH: 0.3, size: 8.4 });

  s.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: 3.35, w: 3.3, h: 1.05, fill: { color: "F3EFE7" }, line: { color: SAGE, width: 0.75 } });
  s.addText("4 条记录全部由真实接口产生，非静态假数据：3 条意向排队 → 队首冻结 → 成交 → 再排队。", {
    x: 6.36, y: 3.42, w: 3.0, h: 0.92, fontFace: FB, fontSize: 8.5, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.15,
  });
}

// ================= P8 分类管理·A.1-02 =================
{
  const s = pres.addSlide();
  header(s, "分类管理", "A.1-02 的「可维护」原来只做了一半", "10-22 版本只有新增，改名与删除缺接口也缺页面", CLAY);
  pageNo(s, 8);

  const rows = [
    [{ text: "编号", options: { bold: true } }, { text: "A.1 验收要求", options: { bold: true } }, { text: "10-22 版本", options: { bold: true } }, { text: "本轮", options: { bold: true } }],
    ["A.1-01", "多商品同时发布", "已满足", "保持"],
    ["A.1-02", "二级分类（卖家可维护）", "部分满足（仅新增）", "满足"],
    ["A.1-03", "库存归零自动下架", "已满足", "保持"],
    ["A.1-04", "浏览 + 搜索", "已满足", "保持"],
    ["A.1-05", "多图 + 富媒体", "已满足", "保持"],
  ];
  table(s, 0.5, 1.2, 5.6, rows, [0.9, 2.55, 1.35, 0.8], { rowH: 0.34, size: 8.8 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.25, w: 5.6, h: 1.1, fill: { color: "F3EFE7" }, line: { color: CLAY, width: 0.75 } });
  s.addText("A.1-02 口径变化", { x: 0.7, y: 3.33, w: 3, h: 0.28, fontFace: FB, fontSize: 10.5, bold: true, color: CLAY_D, margin: 0 });
  s.addText("验收表述是「卖家可维护分类」。只有新增、不能改名、不能删除，分类树一旦建错就无法纠正，判定为部分满足；本轮补齐编辑与删除后转为满足。", {
    x: 0.7, y: 3.62, w: 5.2, h: 0.62, fontFace: FB, fontSize: 9, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.15,
  });

  card(s, 6.35, 1.2, 3.15, 1.62, CLAY, "本轮补齐", [
    "PUT 改名 + 调整排序",
    "层级不可改（防结构破坏）",
    "同级重名拒绝",
    "有子分类时禁止删除",
  ], { bodySize: 9 });
  card(s, 6.35, 2.95, 3.15, 1.4, DEEP, "验证", [
    "TC-A1-07 通过",
    "重名返回「同级分类已存在」",
    "截图 14 为实拍",
  ], { bodySize: 9 });
}

// ================= P9 分类管理·接口 =================
{
  const s = pres.addSlide();
  header(s, "分类管理", "接口与校验规则", "PUT /api/seller/categories/{id}", CLAY);
  pageNo(s, 9);

  codeBox(s, 0.5, 1.18, 4.9, 1.5, [
    { text: "PUT /api/seller/categories/{id}", color: "9CDCFE", bold: true },
    { text: 'Body: { "name": "数码", "sort": 1 }', color: "CE9178" },
    { text: "Response: Result<Category>", color: "B5CEA8" },
    { text: "// 请求体不含 parentId", color: "6A9955" },
  ], { size: 9.5 });

  const rows = [
    [{ text: "#", options: { bold: true } }, { text: "校验规则", options: { bold: true } }, { text: "失败提示", options: { bold: true } }],
    ["1", "分类必须存在", "分类不存在"],
    ["2", "名称非空（@NotBlank）", "分类名称不能为空"],
    ["3", "同级不能重名（改名前先比对）", "同级分类已存在"],
    ["4", "请求体不含 parentId，层级不可改", "结构上无法传入"],
    ["5", "删除时需先清空子分类", "请先删除该分类下的子分类"],
  ];
  table(s, 0.5, 2.82, 6.1, rows, [0.4, 3.35, 2.35], { rowH: 0.32, size: 8.6 });

  s.addShape(pres.shapes.RECTANGLE, { x: 6.9, y: 1.18, w: 2.6, h: 3.1, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.9, y: 1.18, w: 2.6, h: 0.05, fill: { color: DEEP } });
  s.addText("为什么层级不可改", { x: 7.08, y: 1.32, w: 2.3, h: 0.3, fontFace: FB, fontSize: 10.5, bold: true, color: INK, margin: 0 });
  s.addText("分类只有两级，商品以名称字符串关联。若允许把二级分类改成一级，会出现三级隐式层级，且已发布商品的分类标签无法自动迁移。因此用独立的 CategoryUpdateReq（仅 name / sort）从入参层阻断。", {
    x: 7.08, y: 1.68, w: 2.28, h: 2.4, fontFace: FB, fontSize: 8.6, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.2,
  });

  s.addText("已知局限：分类改名后，已发布商品上仍保留旧分类名称（字符串关联），列入遗留项，属模型层改造而非本轮缺陷。", {
    x: 0.5, y: 4.42, w: 9, h: 0.32, fontFace: FB, fontSize: 8.8, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P10 分类管理·页面 =================
{
  const s = pres.addSlide();
  header(s, "分类管理", "页面结构：两级树形表格", "默认展开，行内即可新增子分类、重命名、删除", CLAY);
  pageNo(s, 10);

  const bx = 0.5, bw = 6.0;
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: 1.2, w: bw, h: 3.25, fill: { color: WHITE }, line: { color: "D9D2C8", width: 1 } });
  s.addShape(pres.shapes.RECTANGLE, { x: bx + 0.14, y: 1.34, w: 1.05, h: 0.26, fill: { color: "2F6FD0" } });
  s.addText("新增一级分类", { x: bx + 0.14, y: 1.34, w: 1.05, h: 0.26, fontFace: FB, fontSize: 7.5, color: WHITE, align: "center", valign: "middle", margin: 0 });
  s.addText("两级结构：一级分类 → 二级分类，发布商品时选择", { x: bx + 1.28, y: 1.34, w: 4.2, h: 0.26, fontFace: FB, fontSize: 7.5, color: MUTED, valign: "middle", margin: 0 });

  const hdrs = [["分类名称", 2.35], ["ID", 0.6], ["排序", 0.6], ["操作", 2.3]];
  let hx = bx + 0.14;
  hdrs.forEach(([t, w]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: hx, y: 1.72, w, h: 0.26, fill: { color: "F3EFE7" }, line: { color: "E3DDD4", width: 0.5 } });
    s.addText(t, { x: hx, y: 1.72, w, h: 0.26, fontFace: FB, fontSize: 7.5, bold: true, color: "5E554D", align: "center", valign: "middle", margin: 0 });
    hx += w;
  });

  const tree = [
    ["▾ 数码", "一级", "1", "1", true],
    ["　　配件", "二级", "4", "1", false],
    ["▾ 服饰", "一级", "2", "2", true],
    ["　　配饰", "二级", "5", "1", false],
    ["▾ 家居", "一级", "3", "3", true],
    ["　　餐具", "二级", "6", "1", false],
    ["　　收纳", "二级", "7", "2", false],
  ];
  tree.forEach((r, i) => {
    const y = 2.0 + i * 0.3;
    const indent = r[4] ? 0 : 0.16;
    let x = bx + 0.14;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.35, h: 0.3, fill: { color: r[4] ? "FFFFFF" : "FAF7F2" }, line: { color: "EDE7DE", width: 0.5 } });
    s.addText(r[0], { x: x + 0.06 + indent, y, w: 1.9, h: 0.3, fontFace: FB, fontSize: 7.5, bold: r[4], color: INK, valign: "middle", margin: 0 });
    s.addText(r[1], { x: x + 1.78, y, w: 0.5, h: 0.3, fontFace: FB, fontSize: 6.5, color: r[4] ? "2F6FD0" : MUTED, valign: "middle", margin: 0 });
    x += 2.35;
    ["ID", "排序"].forEach((_, ci) => {
      const w = 0.6;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.3, fill: { color: r[4] ? "FFFFFF" : "FAF7F2" }, line: { color: "EDE7DE", width: 0.5 } });
      s.addText(r[2 + ci], { x, y, w, h: 0.3, fontFace: FB, fontSize: 7.2, color: "4A423C", align: "center", valign: "middle", margin: 0 });
      x += w;
    });
    const actions = r[4] ? ["新增子分类", "重命名", "删除"] : ["重命名", "删除"];
    const aw = [0.78, 0.6, 0.52];
    let ai = 0;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.3, h: 0.3, fill: { color: r[4] ? "FFFFFF" : "FAF7F2" }, line: { color: "EDE7DE", width: 0.5 } });
    actions.forEach((a) => {
      const w = aw[ai];
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.08 + ai * 0.0, y: y + 0.05, w, h: 0.2, fill: { color: a === "删除" ? "FDECEC" : "F2F5FB" }, line: { color: a === "删除" ? "E8B4B4" : "C6D4EC", width: 0.5 } });
      s.addText(a, { x: x + 0.08, y: y + 0.05, w, h: 0.2, fontFace: FB, fontSize: 6, color: a === "删除" ? "B03A3A" : "2F5F9E", align: "center", valign: "middle", margin: 0 });
      x += w + 0.06;
      ai++;
    });
  });
  s.addText("※ 上图为页面结构示意，实际界面见截图 14", { x: bx, y: 4.5, w: bw, h: 0.24, fontFace: FB, fontSize: 7, color: MUTED, italic: true, margin: 0 });

  s.addText("页面行为", { x: 6.75, y: 1.2, w: 2.75, h: 0.3, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0 });
  const items = [
    "默认全展开，一级/二级用标签区分",
    "新增子分类自动带上 parentId",
    "重命名弹窗只提交 name 与 sort",
    "删除前二次确认，提示商品保留旧名",
    "保存后重新拉取整棵分类树",
  ];
  s.addText(
    items.map((t, i) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: i < items.length - 1, paraSpaceAfter: 6 } })),
    { x: 6.75, y: 1.55, w: 2.7, h: 2.4, fontFace: FB, fontSize: 9, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.15 }
  );

  s.addShape(pres.shapes.RECTANGLE, { x: 6.75, y: 3.5, w: 2.75, h: 0.95, fill: { color: "F3EFE7" }, line: { color: SAGE, width: 0.75 } });
  s.addText("接口一次调用即回填整棵树，页面不做本地拼接，避免父子层级不同步。", {
    x: 6.9, y: 3.58, w: 2.45, h: 0.8, fontFace: FB, fontSize: 8.5, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.15,
  });
}

// ================= P11 库存预占 =================
{
  const s = pres.addSlide();
  header(s, "健壮性", "库存预占：把「超卖」堵在提交那一刻", "v0.2.0 引入的机制，本轮复核其与交易状态的交互边界", DEEP);
  pageNo(s, 11);

  const flow = [
    ["提交意向", "reserveStock 预占 1 件", DEEP],
    ["行锁串行", "SELECT ... FOR UPDATE", DEEP],
    ["成交落定", "不重复扣减，仅计销量", CLAY],
    ["失败/撤销/作废", "releaseStock 回补", GOLD],
  ];
  flow.forEach((f, i) => {
    const x = 0.5 + i * 2.38;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.1, h: 0.86, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.1, h: 0.05, fill: { color: f[2] } });
    s.addText(f[0], { x, y: 1.3, w: 2.1, h: 0.3, fontFace: FB, fontSize: 10.5, bold: true, color: INK, align: "center", margin: 0 });
    s.addText(f[1], { x, y: 1.62, w: 2.1, h: 0.36, fontFace: FB, fontSize: 7.8, color: MUTED, align: "center", margin: 0, valign: "top" });
    if (i < flow.length - 1) {
      s.addText("→", { x: x + 2.1, y: 1.4, w: 0.28, h: 0.3, fontFace: FB, fontSize: 13, color: "B9B0A6", align: "center", margin: 0 });
    }
  });

  const rows = [
    [{ text: "边界场景", options: { bold: true } }, { text: "处理方式", options: { bold: true } }],
    ["库存被抢完导致商品自动下架，但队列里还有人", "startTrade 增加 autoOffShelf 分支，自动下架仍允许队首进入交易"],
    ["卖家手动下架时还有等候意向", "offShelf 将 WAITING 置 VOID，并逐条释放其预占库存"],
    ["补货后是否会自动上架", "仅「自动下架」商品恢复在售，不误恢复卖家手动下架的商品"],
    ["成交后商品是否一律下架", "仍有库存则回 ON_SALE 继续销售，归零才转 OFF_SHELF"],
    ["商品页库存的含义", "展示「可用库存」（已扣除预占），卖家无需二次换算"],
  ];
  table(s, 0.5, 2.35, 9, rows, [3.5, 5.5], { rowH: 0.36, size: 8.8 });

  s.addText("现场回归：库存 5 → 4（成交落定）→ 3（新意向预占），商品回到 ON_SALE，销量 1。并发压测仍未做，见遗留项。", {
    x: 0.5, y: 4.5, w: 9, h: 0.3, fontFace: FB, fontSize: 8.8, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P12 拒绝提示 =================
{
  const s = pres.addSlide();
  header(s, "体验", "拒绝提示按商品状态分流", "51a2169：从「一律说交易中」到「说清是下架还是冻结」", CLAY);
  pageNo(s, 12);

  const rows = [
    [{ text: "商品状态", options: { bold: true } }, { text: "提交意向结果", options: { bold: true } }, { text: "提示文案", options: { bold: true } }],
    ["ON_SALE / RESTORED（有库存）", "受理成功", "返回口令码"],
    ["FROZEN（交易冻结）", "拒绝", "商品已冻结停售，暂不接受新的购买意向"],
    ["OFF_SHELF（卖家手动下架）", "拒绝", "商品已下架，无法提交购买意向"],
    ["ON_SALE 但可用库存为 0", "拒绝", "商品库存不足，已被抢完"],
  ];
  table(s, 0.5, 1.25, 9, rows, [3.1, 1.5, 4.4], { rowH: 0.4, size: 9 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.1, w: 4.35, h: 1.15, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.1, w: 0.07, h: 1.15, fill: { color: "9A8C7E" } });
  s.addText("改造前", { x: 0.7, y: 3.18, w: 3, h: 0.28, fontFace: FB, fontSize: 10.5, bold: true, color: INK, margin: 0 });
  s.addText("三种拒绝原因共用一句「商品交易中，暂不接受新的购买意向」，买家无法判断该等待还是该换商品。", {
    x: 0.7, y: 3.48, w: 3.95, h: 0.7, fontFace: FB, fontSize: 9, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.15,
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 3.1, w: 4.35, h: 1.15, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 3.1, w: 0.07, h: 1.15, fill: { color: CLAY } });
  s.addText("改造后", { x: 5.35, y: 3.18, w: 3, h: 0.28, fontFace: FB, fontSize: 10.5, bold: true, color: INK, margin: 0 });
  s.addText("按状态分流，并区分「手动下架」与「库存归零自动下架」，避免把正常销售误报成下架。", {
    x: 5.35, y: 3.48, w: 3.95, h: 0.7, fontFace: FB, fontSize: 9, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.15,
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.42, w: 9, h: 0.5, fill: { color: "F6F0E8" }, line: { color: "E0CDB8", width: 0.75 } });
  s.addText("易误读点：曾出现「商品已下架仍能提交意向」的观察，实为预占库存后触发归零自动下架的先后顺序，符合预占设计，不是缺陷。", {
    x: 0.7, y: 4.46, w: 8.6, h: 0.42, fontFace: FB, fontSize: 8.8, color: "6B4A2F", valign: "middle", margin: 0,
  });
}

// ================= P13 文档一致性 =================
{
  const s = pres.addSlide();
  header(s, "一致性", "四份文档与实现对齐", "53801c5：修掉失效路径，补齐新接口，重写历史记录口径", DEEP);
  pageNo(s, 13);

  const rows = [
    [{ text: "文档", options: { bold: true } }, { text: "问题", options: { bold: true } }, { text: "处理", options: { bold: true } }],
    ["README", "3 处路径失效：query→track、restore→unfreeze、accept→start；客户/分类/历史接口整体缺失", "补 9 条接口，新增挑战 A 完成说明"],
    ["构建部署与接入说明", "接口清单停留在 Sprint 1 口径", "按买家/客户/卖家三组重列，补 token 与预占语义"],
    ["测试用例与运行说明", "缺本轮两项能力用例", "新增 TC-A1-07、TC-A1-08，用例累计 14 项"],
    ["需求规格说明书", "FR-06-02 未覆盖进行中状态与客户用户名；范围外仍列已实现项", "重写 FR-06-02，范围外移除四项并注明由挑战 A 覆盖"],
  ];
  table(s, 0.5, 1.22, 9, rows, [2.0, 4.0, 3.0], { rowH: 0.56, size: 8.6 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.85, w: 9, h: 0.95, fill: { color: "F3EFE7" }, line: { color: SAGE, width: 0.75 } });
  s.addText("为什么把文档修正列为评审项", { x: 0.7, y: 3.92, w: 5, h: 0.26, fontFace: FB, fontSize: 10, bold: true, color: INK, margin: 0 });
  s.addText("文档里的接口路径是外部验收与前端联调的唯一依据。3 处路径失效意味着按文档调用必然 404，属于会被直接判定为「文档与实现不符」的硬伤，因此与功能开发同等级处理。", {
    x: 0.7, y: 4.2, w: 8.6, h: 0.52, fontFace: FB, fontSize: 8.8, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.15,
  });
}

// ================= P14 分工 =================
{
  const s = pres.addSlide();
  header(s, "分工", "分工到人：本轮增量工作", "按模块归属列示，代码分 4 次提交合入", CLAY);
  pageNo(s, 14);

  const rows = [
    [{ text: "完成人", options: { bold: true } }, { text: "承担工作", options: { bold: true } }, { text: "成果物", options: { bold: true } }],
    ["方浩昱（后端②）", "库存预占与释放：reserveStock / releaseStock 行锁串行化；成交不重复扣减；手动下架释放预占", "ProductService、ProductRepository、Product"],
    ["王则凯（后端①）", "交易历史接口与视图对象；匿名/注册客户区分；分类编辑接口与同级重名校验；拒绝提示分流", "ProductController、SellerIntentView、IntentService、CategoryController/Service"],
    ["丁月诚（前端）", "交易历史页（统计卡/筛选/8 列流水）；分类管理页（树形表格/新增子分类/重命名/删除）；路由与菜单", "ProductHistory.vue、CategoryManage.vue、ProductManage.vue、router"],
    ["戴英杰（测试）", "本轮用例设计与实测：TC-A1-07、TC-A1-08；两个新页面界面走查；交易闭环现场回归", "测试用例与运行说明第八章、本报告第三章"],
    ["何易（文档/组长）", "四份文档同步到当前实现；报告与讲述版 PPT 产出；整体协调", "README、接入说明、需求说明书、本报告、讲述版 PPT"],
  ];
  table(s, 0.5, 1.2, 9, rows, [1.5, 4.55, 2.95], { rowH: 0.62, size: 8.3 });

  s.addText("注：增量代码分 4 次提交合入（7c9b48c / f348b19 / 51a2169 / 43073a6），文档统一在 53801c5。", {
    x: 0.5, y: 4.55, w: 9, h: 0.3, fontFace: FB, fontSize: 8.6, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P15 遗留 =================
{
  const s = pres.addSlide();
  header(s, "风险", "遗留问题与风险", "均不影响交易闭环与挑战 A.1 的功能验收", GOLD);
  pageNo(s, 15);

  const rows = [
    [{ text: "类别", options: { bold: true } }, { text: "现状", options: { bold: true } }, { text: "影响", options: { bold: true } }],
    ["自检脚本多商品化（优先）", "verify-api.ps1 仍按「唯一在售」编写，TC-03/TC-04 语义失效", "无法一键回归，只能手工串联"],
    ["运行录屏", "sprint1-demo.mp4 实测仅 134 字节，为 LFS 指针而非视频", "课程要求的录屏实际缺失"],
    ["演示图片资源", "uploads/ 被 .gitignore 排除，新克隆后 /uploads/product_10.png 404", "全新环境首运行封面缺失"],
    ["买家端历史浏览页", "后端已归档，卖家可看，买家无入口", "买家无法回看历史商品"],
    ["数据统计看板", "后端 stats 接口已就绪，前端未接入", "卖家侧无可视化统计"],
    ["分类关联方式", "以名称字符串关联，改名后商品保留旧名", "需改 categoryId 外键"],
    ["并发压测 / 终态命名", "预占有行锁但未压测；VOID 与「失败」表述并存", "并发正确性未量化；口径需统一"],
  ];
  table(s, 0.5, 1.18, 9, rows, [2.2, 4.35, 2.45], { rowH: 0.44, size: 8.3 });

  s.addText("下一迭代优先补齐前两项工程债，使「全新环境可直接演示、回归可一键执行」。", {
    x: 0.5, y: 4.55, w: 9, h: 0.3, fontFace: FB, fontSize: 9, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P16 结论 =================
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.16, h: H, fill: { color: CLAY } });
  s.addText("评审结论", { x: 0.74, y: 0.42, w: 6, h: 0.5, fontFace: FT, fontSize: 24, bold: true, color: WHITE, margin: 0 });
  s.addText("第 3 次阶段性评审 · 2026-11-05", { x: 0.76, y: 0.95, w: 6, h: 0.3, fontFace: FB, fontSize: 10.5, color: "A79E96", margin: 0 });

  const items = [
    ["增量目标 5 / 6 达成", "交易历史、分类管理、库存预占、拒绝提示、文档一致性均已实测通过，仅数据看板前端接入顺延。"],
    ["预占模型下交易闭环自洽", "现场回归：在售 / 库存 3 / 销量 1 / 历史 4 条（成功 1、作废 2、等候 1），状态机、库存、历史三处一致。"],
    ["A.1 五条验收全部具备实现", "分类管理的编辑与删除由本轮补齐，A.1-02 由「部分满足」转为「满足」。"],
    ["下一迭代两项工程债", "多商品版 verify-api.ps1、运行录屏与种子图入库；其余遗留按需排期。"],
  ];
  items.forEach((it, i) => {
    const y = 1.5 + i * 0.92;
    s.addText(String(i + 1), {
      x: 0.76, y, w: 0.42, h: 0.42, fontFace: FT, fontSize: 20, bold: true, color: CLAY, margin: 0,
    });
    s.addText(it[0], { x: 1.3, y: y - 0.02, w: 7.9, h: 0.32, fontFace: FB, fontSize: 12.5, bold: true, color: WHITE, margin: 0 });
    s.addText(it[1], { x: 1.3, y: y + 0.28, w: 7.9, h: 0.42, fontFace: FB, fontSize: 9.2, color: "B9B0A6", margin: 0, valign: "top" });
  });
}

const out = path.join(__dirname, "docs", "media", "第三周_第三次评审_讲述版_详细版.pptx");
pres.writeFile({ fileName: out }).then(() => {
  console.log("PPT 已生成：" + out);
});
