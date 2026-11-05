// 生成《本次优化汇报》PPT
// 运行： $env:NODE_PATH="D:\nodejs\npm-global\node_modules"; node build-optimization-ppt.js
const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "pingxixi 项目组";
pres.title = "本次优化汇报";

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

// ================= P1 封面 =================
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.16, h: H, fill: { color: CLAY } });
  s.addText("本次优化汇报", {
    x: 1.0, y: 1.55, w: 8, h: 0.9, fontFace: FT, fontSize: 44, bold: true, color: WHITE, margin: 0,
  });
  s.addText("卖家端商品交易历史 · 分类管理 · 体验与文档一致性", {
    x: 1.02, y: 2.55, w: 8, h: 0.45, fontFace: FB, fontSize: 15, color: SAND, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 1.02, y: 3.25, w: 1.6, h: 0.04, fill: { color: CLAY } });
  s.addText("2026-11-04 · pingxixi 开发组", {
    x: 1.02, y: 3.5, w: 6, h: 0.35, fontFace: FB, fontSize: 12, color: "A79E96", margin: 0,
  });
  s.addText("仓库：github.com/kaskk345/pingxixi-online-shoppingplatform", {
    x: 1.02, y: 4.55, w: 8, h: 0.3, fontFace: FB, fontSize: 9.5, color: "6E665F", margin: 0,
  });
}

// ================= P2 总览 =================
{
  const s = pres.addSlide();
  header(s, "总览", "本次优化做了什么", "围绕「卖家侧能力补齐」与「文档与实现一致」两条主线", CLAY);
  pageNo(s, 2);

  const y = 1.22, h = 1.55, cw = 2.9;
  card(s, 0.5, y, cw, h, CLAY, "① 商品交易历史", [
    "按商品回看全部交易记录",
    "含终态与买家撤销记录",
    "区分匿名买家与注册客户",
  ]);
  card(s, 3.55, y, cw, h, DEEP, "② 分类管理", [
    "补齐 A.1-02 缺失的编辑能力",
    "后端新增改名/排序接口",
    "前端新增分类管理页",
  ]);
  card(s, 6.6, y, cw, h, "8A6F47", "③ 体验与文档", [
    "拒绝提示按商品状态区分",
    "接口清单/用例/需求文档同步",
    "验收文档按 v0.2.0 口径修正",
  ]);

  const sy = 3.05, sh = 0.95, sw = 2.1;
  stat(s, 0.5, sy, sw, sh, "4", "次提交（10-29 ~ 11-04）", CLAY);
  stat(s, 2.75, sy, sw, sh, "2", "个新增接口", DEEP);
  stat(s, 5.0, sy, sw, sh, "2", "个新增页面", "8A6F47");
  stat(s, 7.25, sy, sw, sh, "+508", "行代码 / 文档", SAGE);

  s.addText("注：交易历史与分类管理为 v0.2.0 交付之后的增量内容，交付口径仍为 v0.2.0（43073a6）。", {
    x: 0.5, y: 4.25, w: 9, h: 0.3, fontFace: FB, fontSize: 9, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P3 交易历史·背景 =================
{
  const s = pres.addSlide();
  header(s, "交易历史", "为什么做：卖家看不到「按商品」的交易履历", "需求规格 FR-06-02 要求以商品为单位归档全部意向流水", CLAY);
  pageNo(s, 3);

  card(s, 0.5, 1.2, 4.4, 1.5, "9A8C7E", "改造前", [
    "卖家只能看到全局「意向列表」",
    "商品下架后，其历史记录无法按商品回溯",
    "已结束（成交/失败/撤销）的记录混在列表里",
  ]);
  card(s, 5.1, 1.2, 4.4, 1.5, CLAY, "改造后", [
    "以商品为主体，一键进入该商品全部记录",
    "终态订单同样保留，可按「已结束」筛选",
    "匿名买家与注册客户分列展示，便于核对",
  ]);

  s.addText("能力缺口示意", {
    x: 0.5, y: 2.95, w: 3, h: 0.3, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0,
  });

  const rows = [
    [{ text: "场景", options: { bold: true } }, { text: "原系统", options: { bold: true } }, { text: "本次优化后", options: { bold: true } }],
    ["卖家查看某件已下架商品卖给了谁", "无法直接查", "商品 → 交易历史"],
    ["核对某商品成交 / 失败 / 撤销各多少", "需人工翻列表", "统计卡片直接给出"],
    ["区分下单人是注册客户还是访客", "字段分散", "来源列 + 客户账号列"],
  ];
  table(s, 0.5, 3.3, 9, rows, [4.0, 2.2, 2.8], { rowH: 0.34 });
}

// ================= P4 交易历史·接口 =================
{
  const s = pres.addSlide();
  header(s, "交易历史", "接口与数据结构", "GET /api/seller/products/{id}/history", CLAY);
  pageNo(s, 4);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.18, w: 5.55, h: 1.28, fill: { color: "2B2622" }, line: { color: "2B2622", width: 1 },
  });
  s.addText(
    [
      { text: "GET /api/seller/products/{id}/history", options: { color: "9CDCFE", bold: true, breakLine: true } },
      { text: "Header: X-Token  (AuthInterceptor 拦截 /api/seller/**)", options: { color: "CE9178", breakLine: true } },
      { text: "Response: Result<List<SellerIntentView>>", options: { color: "B5CEA8", breakLine: false } },
    ].map((t) => ({ text: t.text.replace(/\\n/g, ""), options: t.options })),
    { x: 0.72, y: 1.3, w: 5.1, h: 1.0, fontFace: "Consolas", fontSize: 10, valign: "top", margin: 0, lineSpacingMultiple: 1.25 }
  );

  card(s, 6.3, 1.18, 3.2, 1.28, DEEP, "核心实现", [
    "Service：IntentService.historyByProduct",
    "DTO：SellerIntentView（12 字段）",
    "不直接暴露实体",
  ], { bodySize: 9 });

  s.addText("SellerIntentView 字段", {
    x: 0.5, y: 2.6, w: 3, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0,
  });

  const rows = [
    [{ text: "字段", options: { bold: true } }, { text: "说明", options: { bold: true } }],
    ["id / productId", "记录编号、所属商品"],
    ["buyerName / buyerPhone", "买家姓名与电话（访客也保留）"],
    ["customerId / customerUsername", "为空即匿名买家；非空为注册客户"],
    ["status / statusLabel", "WAITING / TRADING / SUCCEEDED / FAILED / VOID / CANCELED"],
    ["result / resultLabel", "交易结果，未出结果时为 null"],
    ["queueTime / createdAt", "排队时间（先到先得依据）、提交时间"],
  ];
  table(s, 0.5, 2.95, 9, rows, [3.0, 6.0], { rowH: 0.3, size: 9 });
}

// ================= P5 交易历史·页面 =================
{
  const s = pres.addSlide();
  header(s, "交易历史", "前端页面：/seller/products/:id/history", "独立页面，从商品列表一键进入（点商品名或「交易历史」按钮）", CLAY);
  pageNo(s, 5);

  // 页面示意
  const bx = 0.5, by = 1.2, bw = 9.0;
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: by, w: bw, h: 3.55, fill: { color: WHITE }, line: { color: "E3DDD4", width: 1 }, shadow: shadow() });

  // 顶部栏
  s.addShape(pres.shapes.RECTANGLE, { x: bx + 0.12, y: by + 0.12, w: 1.05, h: 0.28, fill: { color: "F0EDE7" } });
  s.addText("‹ 返回", { x: bx + 0.12, y: by + 0.12, w: 1.05, h: 0.28, fontFace: FB, fontSize: 8.5, color: "6E665F", align: "center", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: bx + 1.28, y: by + 0.12, w: 0.45, h: 0.45, fill: { color: "EDE8E0" } });
  s.addText("商品名 / 商品 #ID", { x: bx + 1.85, y: by + 0.12, w: 3.2, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: bx + 8.1, y: by + 0.14, w: 0.75, h: 0.26, fill: { color: SAGE } });
  s.addText("在售", { x: bx + 8.1, y: by + 0.14, w: 0.75, h: 0.26, fontFace: FB, fontSize: 8, color: WHITE, align: "center", valign: "middle", margin: 0 });

  // 描述行
  s.addShape(pres.shapes.RECTANGLE, { x: bx + 0.12, y: by + 0.68, w: 8.75, h: 0.3, fill: { color: "F7F4EE" }, line: { color: "E3DDD4", width: 0.5 } });
  s.addText("价格 ¥199  ·  库存 5  ·  销量 0  ·  分类 服饰 / 配饰", {
    x: bx + 0.2, y: by + 0.68, w: 8.5, h: 0.3, fontFace: FB, fontSize: 8.5, color: "6E665F", valign: "middle", margin: 0,
  });

  // 统计卡片
  const names = [["全部记录", "3"], ["交易成功", "1"], ["进行中", "1"], ["匿名买家", "2"]];
  names.forEach((n, i) => {
    const cx = bx + 0.12 + i * 2.2;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: by + 1.08, w: 2.05, h: 0.62, fill: { color: WHITE }, line: { color: "EBE5DC", width: 0.75 } });
    s.addText(n[1], { x: cx + 0.12, y: by + 1.12, w: 0.8, h: 0.52, fontFace: FT, fontSize: 18, bold: true, color: CLAY, valign: "middle", margin: 0 });
    s.addText(n[0], { x: cx + 0.7, y: by + 1.3, w: 1.2, h: 0.28, fontFace: FB, fontSize: 8, color: MUTED, valign: "middle", margin: 0 });
  });

  // 筛选
  s.addShape(pres.shapes.RECTANGLE, { x: bx + 0.12, y: by + 1.82, w: 2.3, h: 0.28, fill: { color: "F0EDE7" } });
  s.addText("全部  |  进行中  |  已结束", { x: bx + 0.12, y: by + 1.82, w: 2.3, h: 0.28, fontFace: FB, fontSize: 8, color: "6E665F", align: "center", valign: "middle", margin: 0 });

  // 表格表头
  const cols = ["编号", "姓名", "联系电话", "买家来源", "客户账号", "状态", "交易结果", "排队时间"];
  let tx = bx + 0.12;
  const colW2 = [0.62, 0.9, 1.15, 1.05, 1.15, 0.95, 1.05, 1.6];
  cols.forEach((c, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: by + 2.2, w: colW2[i], h: 0.3, fill: { color: "F2EEE6" }, line: { color: "E3DDD4", width: 0.5 } });
    s.addText(c, { x: tx, y: by + 2.2, w: colW2[i], h: 0.3, fontFace: FB, fontSize: 7.5, bold: true, color: INK, align: "center", valign: "middle", margin: 0 });
    tx += colW2[i];
  });

  // 两行数据
  const dataRows = [
    ["1", "张三", "13800000001", "匿名买家", "—", "交易成功", "成功", "10-29 10:09"],
    ["2", "李四", "13900000002", "注册客户", "testbuyer01", "等候中", "—", "10-29 10:11"],
  ];
  dataRows.forEach((r, ri) => {
    let x2 = bx + 0.12;
    const yy = by + 2.5 + ri * 0.32;
    r.forEach((v, i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: x2, y: yy, w: colW2[i], h: 0.32, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.5 } });
      s.addText(v, { x: x2, y: yy, w: colW2[i], h: 0.32, fontFace: FB, fontSize: 7.5, color: "4A423C", align: "center", valign: "middle", margin: 0 });
      x2 += colW2[i];
    });
  });

  s.addText("※ 上图为页面结构示意，实际界面见 docs/wiki/screenshots（待补）", {
    x: bx + 0.12, y: by + 3.22, w: 8.6, h: 0.26, fontFace: FB, fontSize: 8, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P6 交易历史·验证 =================
{
  const s = pres.addSlide();
  header(s, "交易历史", "验证：真实接口实测通过", "后端重启后调用接口，构造匿名与注册客户各一条记录", CLAY);
  pageNo(s, 6);

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.18, w: 4.3, h: 1.7, fill: { color: "2B2622" } });
  s.addText(
    [
      { text: "GET /api/seller/products/2/history", options: { color: "9CDCFE", breakLine: true } },
      { text: "→ code=0, count=2", options: { color: "B5CEA8", breakLine: true } },
      { text: "id=1  customerId=null      ← 匿名买家", options: { color: "DCDCAA", breakLine: true } },
      { text: "id=2  customerId=2  testbuyer01", options: { color: "DCDCAA", breakLine: true } },
      { text: "      status=WAITING", options: { color: "DCDCAA", breakLine: false } },
    ],
    { x: 0.72, y: 1.3, w: 3.9, h: 1.45, fontFace: "Consolas", fontSize: 9.5, valign: "top", margin: 0, lineSpacingMultiple: 1.3 }
  );

  card(s, 5.05, 1.18, 4.45, 1.7, DEEP, "验证要点", [
    "匿名买家 customerId 为空，仅保留姓名与电话",
    "注册客户带 customerId 与用户名",
    "终态记录同样返回，不受商品状态影响",
    "接口受 /api/seller/** 鉴权保护，未登录 401",
  ], { bodySize: 9 });

  s.addText("同时验证的边界", {
    x: 0.5, y: 3.05, w: 4, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0,
  });

  const rows = [
    [{ text: "场景", options: { bold: true } }, { text: "结果", options: { bold: true } }],
    ["商品不存在", "返回业务错误，不抛 500"],
    ["该商品无任何意向", "返回空数组，前端显示「暂无交易记录」"],
    ["未携带 X-Token", "HTTP 401，未登录或登录已过期"],
  ];
  table(s, 0.5, 3.4, 9, rows, [4.0, 5.0], { rowH: 0.34 });
}

// ================= P7 分类管理·缺口 =================
{
  const s = pres.addSlide();
  header(s, "分类管理", "补齐 A.1-02：从「部分满足」到「完整满足」", "课程挑战 A.1 第 2 条：商品支持 2 级类别管理", DEEP);
  pageNo(s, 7);

  card(s, 0.5, 1.2, 4.4, 1.6, "9A8C7E", "原状态（部分满足）", [
    "有 Category 实体与分类树",
    "后端只有「新增」「删除」两个接口",
    "没有重命名 / 排序能力",
    "前端无分类管理入口，只能调接口",
  ]);
  card(s, 5.1, 1.2, 4.4, 1.6, DEEP, "本次补齐", [
    "后端新增 PUT 编辑接口（名称 + 排序）",
    "同级重名校验，避免分类混淆",
    "不允许改层级，保护两级结构",
    "前端新增「分类管理」页，全量可维护",
  ]);

  s.addText("验收对照", {
    x: 0.5, y: 3.0, w: 3, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0,
  });

  const rows = [
    [{ text: "A.1 共 5 条", options: { bold: true } }, { text: "优化前", options: { bold: true } }, { text: "优化后", options: { bold: true } }],
    ["① 可同时发布多个商品", "满足", "满足"],
    ["② 商品支持 2 级类别管理", "部分满足", "满足"],
    ["③ 库存为 0 自动下架", "满足", "满足"],
    ["④ 浏览 + 搜索两种方式", "满足", "满足"],
    ["⑤ 多图 + 富媒体描述", "满足", "满足"],
  ];
  table(s, 0.5, 3.35, 9, rows, [4.2, 2.4, 2.4], { rowH: 0.28, size: 9 });
}

// ================= P8 分类管理·后端 =================
{
  const s = pres.addSlide();
  header(s, "分类管理", "后端改造", "PUT /api/seller/categories/{id}", DEEP);
  pageNo(s, 8);

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.18, w: 5.4, h: 1.05, fill: { color: "2B2622" } });
  s.addText(
    [
      { text: "PUT /api/seller/categories/{id}", options: { color: "9CDCFE", bold: true, breakLine: true } },
      { text: "Body: { \"name\": \"服饰\", \"sort\": 2 }", options: { color: "CE9178", breakLine: false } },
    ],
    { x: 0.72, y: 1.3, w: 5.0, h: 0.8, fontFace: "Consolas", fontSize: 10, valign: "top", margin: 0, lineSpacingMultiple: 1.3 }
  );

  card(s, 6.15, 1.18, 3.35, 1.05, DEEP, "配套调整", [
    "tree() 补 parentId / sort 字段",
    "一级节点也能判断层级与排序",
  ], { bodySize: 9 });

  s.addText("校验规则", {
    x: 0.5, y: 2.45, w: 3, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0,
  });

  const rows = [
    [{ text: "规则", options: { bold: true } }, { text: "说明", options: { bold: true } }],
    ["分类必须存在", "否则「分类不存在」"],
    ["名称非空", "空名称直接拒绝"],
    ["同级不可重名", "排除自身后校验，「同级分类已存在」"],
    ["不可改层级", "请求体不接受 parentId，只改名称与排序"],
    ["删除保护", "一级分类下仍有子分类时拒绝删除"],
  ];
  table(s, 0.5, 2.8, 9, rows, [3.0, 6.0], { rowH: 0.31 });

  s.addText("实测：改名成功 code=0；重名返回「同级分类已存在」；mvn compile 与 npm run build 均通过。", {
    x: 0.5, y: 4.85, w: 9, h: 0.26, fontFace: FB, fontSize: 8.5, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P9 分类管理·页面 =================
{
  const s = pres.addSlide();
  header(s, "分类管理", "前端页面：/seller/categories", "树形表格，一级/二级分开展示，操作按层级区分", DEEP);
  pageNo(s, 9);

  const bx = 0.5, by = 1.2, bw = 9.0;
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: by, w: bw, h: 3.5, fill: { color: WHITE }, line: { color: "E3DDD4", width: 1 }, shadow: shadow() });

  s.addShape(pres.shapes.RECTANGLE, { x: bx + 0.15, y: by + 0.15, w: 1.35, h: 0.32, fill: { color: CLAY } });
  s.addText("新增一级分类", { x: bx + 0.15, y: by + 0.15, w: 1.35, h: 0.32, fontFace: FB, fontSize: 8.5, color: WHITE, align: "center", valign: "middle", margin: 0 });
  s.addText("两级结构：一级分类 → 二级分类，发布商品时选择", {
    x: bx + 1.65, y: by + 0.15, w: 5.5, h: 0.32, fontFace: FB, fontSize: 8.5, color: MUTED, valign: "middle", margin: 0,
  });

  // 表头
  const head = ["分类名称", "ID", "排序", "操作"];
  const hw = [4.2, 0.7, 0.8, 3.0];
  let hx = bx + 0.15;
  head.forEach((t, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: hx, y: by + 0.62, w: hw[i], h: 0.32, fill: { color: "F2EEE6" }, line: { color: "E3DDD4", width: 0.5 } });
    s.addText(t, { x: hx, y: by + 0.62, w: hw[i], h: 0.32, fontFace: FB, fontSize: 8.5, bold: true, color: INK, align: "center", valign: "middle", margin: 0 });
    hx += hw[i];
  });

  const data = [
    ["▾ 数码", "一级", "1", "1", "＋子分类  重命名  删除"],
    ["    配件", "二级", "4", "1", "重命名  删除"],
    ["▾ 服饰", "一级", "2", "2", "＋子分类  重命名  删除"],
    ["    配饰", "二级", "5", "1", "重命名  删除"],
    ["▾ 家居", "一级", "3", "3", "＋子分类  重命名  删除"],
  ];
  data.forEach((r, ri) => {
    const yy = by + 0.94 + ri * 0.34;
    const bg = ri % 2 === 0 ? WHITE : "FCFAF6";
    let cx = bx + 0.15;
    const vals = [r[0], r[2], r[3], r[4]];
    vals.forEach((v, i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: yy, w: hw[i], h: 0.34, fill: { color: bg }, line: { color: "E3DDD4", width: 0.5 } });
      s.addText(v, {
        x: cx + 0.06, y: yy, w: hw[i] - 0.12, h: 0.34, fontFace: FB, fontSize: 8,
        color: i === 0 ? INK : "6E665F", align: i === 0 ? "left" : "center", valign: "middle", margin: 0,
        bold: r[1] === "一级" && i === 0,
      });
      cx += hw[i];
    });
  });

  s.addText("※ 页面结构示意；一级分类展开后显示其二级分类，操作按钮按层级区分", {
    x: bx + 0.15, y: by + 3.05, w: 8.6, h: 0.26, fontFace: FB, fontSize: 8, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P10 提示文案 =================
{
  const s = pres.addSlide();
  header(s, "体验", "拒绝提示按商品状态区分", "同一个校验分支，原来只有一句笼统提示", "8A6F47");
  pageNo(s, 10);

  card(s, 0.5, 1.2, 4.4, 1.35, "9A8C7E", "改造前", [
    "已下架、已冻结都提示：「商品交易中，暂不接受新的购买意向」",
    "已下架商品提示「交易中」明显误导",
  ], { bodySize: 9.5 });
  card(s, 5.1, 1.2, 4.4, 1.35, "8A6F47", "改造后", [
    "OFF_SHELF →「商品已下架，无法提交购买意向」",
    "FROZEN →「商品已冻结停售，暂不接受新的购买意向」",
  ], { bodySize: 9.5 });

  s.addText("实测", {
    x: 0.5, y: 2.8, w: 2, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0,
  });

  const rows = [
    [{ text: "商品状态", options: { bold: true } }, { text: "返回", options: { bold: true } }, { text: "提示文案", options: { bold: true } }],
    ["已下架（商品 3）", "code=1", "商品已下架，无法提交购买意向"],
    ["已冻结（商品 1 冻结后）", "code=1", "商品已冻结停售，暂不接受新的购买意向"],
    ["在售（正常提交）", "code=0", "返回口令码，进入排队"],
  ];
  table(s, 0.5, 3.15, 9, rows, [3.4, 1.6, 4.0], { rowH: 0.36 });

  s.addText("说明：商品 2 曾出现「已下架仍能提交」的假象，实为提交意向预占库存后触发「库存归零自动下架」，先后顺序不同。", {
    x: 0.5, y: 4.6, w: 9, h: 0.3, fontFace: FB, fontSize: 8.5, color: MUTED, italic: true, margin: 0,
  });
}

// ================= P11 文档一致性 =================
{
  const s = pres.addSlide();
  header(s, "文档", "文档与实现对齐", "4 份文档、+56 行，消除「文档说的」与「代码做的」之间的偏差", "8A6F47");
  pageNo(s, 11);

  const rows = [
    [{ text: "文档", options: { bold: true } }, { text: "问题", options: { bold: true } }, { text: "处理", options: { bold: true } }],
    ["构建部署与接入说明", "接口清单只列 21 条且含错误描述", "补全至 40 条；修正「已有在售商品时拒绝」等过时说明"],
    ["测试用例与运行说明", "无分类管理、交易历史用例", "新增 TC-A1-07 / TC-A1-08，用例数 12 → 14"],
    ["需求规格说明书", "FR-06-02 口径与实现不符；FR-07 仍列已实现项", "改为含进行中记录；范围外条目移除挑战 A 已覆盖部分"],
    ["README", "接口表 3 处路径错误、项目简介仍是单品单卖", "修正 query→track、restore→unfreeze、accept→start；补挑战 A 现状"],
  ];
  table(s, 0.5, 1.2, 9, rows, [2.1, 3.2, 3.7], { rowH: 0.52, size: 8.5 });

  s.addText("交付口径", {
    x: 0.5, y: 4.05, w: 2, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.38, w: 9, h: 0.62, fill: { color: "F3EFE7" }, line: { color: "E3D9C9", width: 0.75 } });
  s.addText("第 2 次成果交付版本仍为 v0.2.0（提交 43073a6）；商品交易历史（7c9b48c）与分类管理（f348b19）为之后的增量内容，已在验收文档中明确标注。", {
    x: 0.68, y: 4.45, w: 8.6, h: 0.5, fontFace: FB, fontSize: 9, color: "4A423C", valign: "middle", margin: 0,
  });
}

// ================= P12 下一步 =================
{
  const s = pres.addSlide();
  header(s, "下一步", "遗留问题与后续计划", "当前状态：代码与文档已对齐，主仓库与 Wiki 均已同步", CLAY_D);
  pageNo(s, 12);

  card(s, 0.5, 1.2, 4.4, 1.75, CLAY_D, "待补齐", [
    "第二次评审演示录像缺失（sprint1-demo.mp4 仅 134 字节）",
    "新页面截图未补（分类管理 / 交易历史）",
    "种子商品图片 404（/uploads/product_10.png 不存在）",
  ], { bodySize: 9.5 });
  card(s, 5.1, 1.2, 4.4, 1.75, SAGE, "已完成", [
    "交易历史：接口 + 页面 + 实测",
    "分类管理：后端编辑 + 前端管理页",
    "文档 4 份同步，主仓库与 Wiki 一致",
  ], { bodySize: 9.5 });

  s.addText("后续方向", {
    x: 0.5, y: 3.15, w: 3, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, margin: 0,
  });

  const items = [
    ["挑战 B / C / D / E", "课程需求待老师陆续发布，按解锁节奏推进"],
    ["演示材料", "补录第二次演示视频，覆盖多商品、分类、库存、客户与交易历史"],
    ["测试脚本", "verify-api.ps1 仍按「唯一在售」编写，需改为多商品版"],
  ];
  items.forEach((it, i) => {
    const yy = 3.55 + i * 0.5;
    s.addShape(pres.shapes.OVAL, { x: 0.5, y: yy + 0.08, w: 0.18, h: 0.18, fill: { color: CLAY } });
    s.addText(it[0], { x: 0.8, y: yy, w: 2.5, h: 0.32, fontFace: FB, fontSize: 10, bold: true, color: INK, valign: "middle", margin: 0 });
    s.addText(it[1], { x: 3.35, y: yy, w: 6.1, h: 0.32, fontFace: FB, fontSize: 9.5, color: "6E665F", valign: "middle", margin: 0 });
  });
}

const out = path.join(__dirname, "docs", "media", "本次优化_汇报.pptx");
pres.writeFile({ fileName: out }).then(() => {
  console.log("PPT 已生成：" + out);
});
