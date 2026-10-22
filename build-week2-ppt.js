// 生成《第二周 · 第二次阶段性评审》讲述版 PPT（每页含演讲者备注讲稿）
// 结构：重点二 A.1/A.2 实现前移（P4~P6），重点一 Sprint 1 基线复测（P7~P10）
// 运行： cmd /c "set NODE_PATH=C:\Users\yuanx\AppData\Roaming\npm\node_modules&& node build-week2-ppt.js"
const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "pingxixi 项目组";
pres.title = "第二周 · 第二次阶段性评审（讲述版）";

const INK = "2B2622", CLAY = "B85042", CLAY_D = "8E3B33", SAND = "E7E8D1";
const CREAM = "FBF8F3", SAGE = "A7BEAE", MUTED = "8A8178", WHITE = "FFFFFF";
const GREEN = "6B8E7B", GREEN_D = "4F7160";
const FT = "Microsoft YaHei", FB = "Microsoft YaHei";
const W = 10, H = 5.625;

const IMG = (n) => path.join(__dirname, "docs", "wiki", "screenshots", n);
const shadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.1 });

function pageNo(s, n) {
  s.addText(String(n), { x: 9.2, y: 5.05, w: 0.5, h: 0.28, fontFace: FB, fontSize: 9, color: MUTED, align: "right", valign: "middle", margin: 0 });
}
function header(s, title, sub, accent) {
  s.background = { color: CREAM };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.09, fill: { color: accent || CLAY } });
  s.addText(title, { x: 0.5, y: 0.26, w: 9, h: 0.46, fontFace: FT, fontSize: 22, bold: true, color: INK, valign: "middle", margin: 0 });
  if (sub) s.addText(sub, { x: 0.5, y: 0.76, w: 9, h: 0.3, fontFace: FB, fontSize: 11, color: MUTED, valign: "middle", margin: 0 });
}
function card(s, x, y, w, h, color, title, lines, opt = {}) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h, fill: { color } });
  s.addText(title, { x: x + 0.22, y: y + 0.12, w: w - 0.36, h: 0.3, fontFace: FB, fontSize: 12.5, bold: true, color: INK, valign: "middle", margin: 0 });
  s.addText(
    lines.map((t, i) => ({ text: t, options: { breakLine: i < lines.length - 1, bullet: { code: "2022" }, paraSpaceAfter: 3 } })),
    { x: x + 0.22, y: y + 0.46, w: w - 0.36, h: h - 0.6, fontFace: FB, fontSize: opt.bodySize || 10, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.05 }
  );
}
function stat(s, x, y, w, h, num, label, color) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
  s.addText(num, { x, y: y + 0.08, w, h: 0.6, fontFace: FT, fontSize: 28, bold: true, color, align: "center", valign: "middle", margin: 0 });
  s.addText(label, { x, y: y + 0.62, w, h: 0.3, fontFace: FB, fontSize: 9.5, color: MUTED, align: "center", valign: "middle", margin: 0 });
}
function img(s, name, x, y, w, h) {
  s.addImage({ path: IMG(name), x, y, w, h, sizing: { type: "contain", w, h } });
}

// ============ P1 封面 ============
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.5, h: H, fill: { color: CLAY } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.95, y: 1.1, w: 0.13, h: 2.2, fill: { color: SAGE } });
  s.addText("第二周 · 第二次阶段性评审", { x: 1.3, y: 1.05, w: 8.2, h: 0.8, fontFace: FT, fontSize: 34, bold: true, color: WHITE, margin: 0, valign: "middle" });
  s.addText("在线购物系统（挑战升级）· 单品单卖直销系统", { x: 1.3, y: 1.9, w: 8.2, h: 0.5, fontFace: FB, fontSize: 17, color: SAND, margin: 0, valign: "middle" });
  s.addText("Sprint 1 收尾复测 · A.1 / A.2 挑战升级已实现", { x: 1.3, y: 2.45, w: 8.4, h: 0.4, fontFace: FB, fontSize: 15, bold: true, color: "E9A292", margin: 0, valign: "middle" });
  s.addText("接口 14 项基线断言 + A.1/A.2 升级 12 项用例 · 12 张界面截图 · 演示视频已归档", { x: 1.3, y: 2.95, w: 8.6, h: 0.35, fontFace: FB, fontSize: 11.5, color: "B9B2A8", margin: 0, valign: "middle" });
  s.addText("软件工程课程设计 · 第 4 组　|　2026-10-22", { x: 1.3, y: 4.7, w: 8, h: 0.3, fontFace: FB, fontSize: 10.5, color: "A79E94", margin: 0, valign: "middle" });
  s.addNotes("各位老师、同学好，我是第 4 组的何易。今天代表小组汇报第二次阶段性评审。这一周有两个重点：第一，Sprint 1 的交付物在真实运行环境下复测通过；第二，课程挑战升级 A.1、A.2 已经完成实现并通过接口联调。下面我按这两条主线展开。");
}

// ============ P2 评审概览 ============
{
  const s = pres.addSlide();
  header(s, "本周评审概览", "两个重点：重点二 A.1/A.2 升级实现（前移），重点一 Sprint 1 基线复测", CLAY);
  card(s, 0.5, 1.3, 4.35, 2.45, GREEN, "重点二 · A.1 / A.2 升级实现", [
    "提交 4f2fde7，31 文件，+1148 / −546",
    "A.1 多商品 / 二级分类 / 库存 / 搜索 / 多媒体",
    "A.2 客户注册 / 历史下单 / 商家客户视图",
    "12 项升级用例全过，7 张升级后截图",
  ], { bodySize: 10 });
  card(s, 5.15, 1.3, 4.35, 2.45, CLAY, "重点一 · Sprint 1 基线复测", [
    "后端 :8080 与前端 :5173 重新拉起",
    "verify-api.ps1 跑 14 项接口断言",
    "浏览器自动化截关键页面",
    "核对测试报告与端到端验证记录",
  ], { bodySize: 10 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.0, w: 9, h: 0.85, fill: { color: SAND } });
  s.addText(
    [{ text: "一句话：", options: { bold: true } }, { text: "基线「单品单卖」已交付并复测通过，本轮的增量是把 A.1 / A.2 挑战升级从「登记范围」变为「已实现、已联调、已验证」。" }],
    { x: 0.72, y: 4.0, w: 8.6, h: 0.85, fontFace: FB, fontSize: 11, color: INK, valign: "middle", margin: 0 }
  );
  pageNo(s, 2);
  s.addNotes("本周定位有两个重点。重点二放在前面讲，因为这是本轮的增量成果：A.1 商品管理升级、A.2 客户升级已经完成实现，提交号 4f2fde7，通过了 12 项升级用例和 7 张升级后截图。重点一是 Sprint 1 基线的复测，把之前交付的东西在今天的机器上再证明一遍。");
}

// ============ P3 目标达成 ============
{
  const s = pres.addSlide();
  header(s, "迭代目标达成情况", "对照 Sprint 1 八项目标：全部达成（目标 1 已被 A.1 升级取代）", SAGE);
  const head = (t) => ({ text: t, options: { bold: true, fill: { color: CLAY }, color: WHITE } });
  const rows = [
    [head("#"), head("目标"), head("状态"), head("验证证据")],
    ["1", "单品单卖：同一时刻最多 1 件在售", "已达成（已被 A.1 取代）", "TC-04"],
    ["2", "商品四态状态机", "已达成", "TC-08 / 10 / 11"],
    ["3", "买家免注册提交意向（注册客户为新增可选）", "已达成", "TC-03 / 05"],
    ["4", "口令码机制（查询/改信息/撤销/失效）", "已达成", "TC-05 / 12 / 13"],
    ["5", "先到先得队列", "已达成", "TC-06 / 07"],
    ["6", "交易结果登记", "已达成", "TC-10 / 11 / 12"],
    ["7", "卖家后台（登录/管理/改密/上传）", "已达成", "TC-01 / 02 + 截图"],
    ["8", "回归基线（移除购物车与订单）", "已达成", "截图 01 / 04"],
  ];
  s.addTable(rows, { x: 0.5, y: 1.3, w: 9, colW: [0.5, 4.3, 1.6, 2.6], rowH: 0.31, fontFace: FB, fontSize: 9.5, color: INK, valign: "middle", border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.5, w: 9, h: 0.6, fill: { color: SAND } });
  s.addText(
    [{ text: "结论：", options: { bold: true } }, { text: "8 项目标按当时定义 100% 达成；目标 1 的「单品单卖」约束在 A.1 中被显式取消（详见下一页）。" }],
    { x: 0.72, y: 4.5, w: 8.6, h: 0.6, fontFace: FB, fontSize: 11, color: INK, valign: "middle", margin: 0 }
  );
  pageNo(s, 3);
  s.addNotes("这是 Sprint 1 的八项目标，全部达成，右边是对应的测试用例或截图。注意第一条「单品单卖」标了「已被 A.1 取代」——它只是 Sprint 1 的阶段约束，在挑战升级里被多商品和真实库存取代了，其余七条不变。");
}

// ============ P4 A.1 商品管理升级（已实现） ============
{
  const s = pres.addSlide();
  header(s, "重点二 · A.1 商品管理升级（已实现）", "提交 4f2fde7 · 多商品 / 二级分类 / 库存 / 搜索 / 多媒体", GREEN);
  const head = (t) => ({ text: t, options: { bold: true, fill: { color: GREEN }, color: WHITE } });
  const rows = [
    [head("#"), head("升级点"), head("升级后实现"), head("验证")],
    ["01", "多商品", "取消单品单卖校验，可同时发布多件在售商品", "TC-A1-01（3→4 件）"],
    ["02", "二级类别", "新增 Category 实体与分类树，商品保存两级分类", "TC-A1-02（3 个一级分类）"],
    ["03", "库存数量", "带 stock；成交扣 1，归零自动下架，有余量回在售", "TC-A1-03/04（1→0）"],
    ["04", "查找方式", "首页多商品列表（浏览）+ 关键词/分类筛选（搜索）", "TC-A1-05"],
    ["05", "多媒体", "多图（详情页轮播）+ 富媒体描述（v-html 渲染）", "TC-A1-06"],
  ];
  s.addTable(rows, { x: 0.5, y: 1.25, w: 9, colW: [0.45, 1.4, 4.55, 2.6], rowH: 0.38, fontFace: FB, fontSize: 8.5, color: INK, valign: "middle", border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false });
  img(s, "06-home-multi.png", 0.5, 3.68, 3.5, 1.5);
  s.addText("首页多商品列表：浏览 + 搜索 + 两级分类", { x: 0.5, y: 5.2, w: 3.5, h: 0.26, fontFace: FB, fontSize: 8.5, bold: true, color: GREEN_D, align: "center", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 4.3, y: 3.68, w: 5.2, h: 1.5, fill: { color: SAND } });
  s.addText("实现要点：新增 Category 实体；Product 增加 stock / sales / images / categoryL2 / soldAt；publish 解除单品单卖限制；markSoldByTrade 成交扣减库存、归零自动下架；新增 GET /api/products/search 支持关键词 + 一级/二级分类。", { x: 4.52, y: 3.68, w: 4.8, h: 1.5, fontFace: FB, fontSize: 9, color: INK, valign: "middle", margin: 0 });
  pageNo(s, 4);
  s.addNotes("先讲重点二。A.1 商品管理升级，五条逐条对照：多商品——取消了单品单卖，可以同时上多件；二级分类——新增了分类实体和分类树；库存——每种商品有真实库存，成交扣一件，扣到零自动下架；查找——首页既能浏览多商品，也能按关键词和两级分类搜索；多媒体——多张图轮播，描述支持富媒体渲染。每条都对应一条测试用例，全部通过。");
}

// ============ P5 A.2 客户升级（已实现） ============
{
  const s = pres.addSlide();
  header(s, "重点二 · A.2 客户升级（已实现）", "提交 4f2fde7 · 自由注册 / 历史下单 / 商家客户视图", GREEN_D);
  const head = (t) => ({ text: t, options: { bold: true, fill: { color: GREEN_D }, color: WHITE } });
  const rows = [
    [head("#"), head("升级点"), head("升级后实现"), head("验证")],
    ["01", "客户注册", "Customer 实体 + 自由注册：用户名 / 密码 / 电话 / 默认交易地点", "TC-A2-01"],
    ["02", "历史下单", "登录取 token，意向关联 customerId，可查历史下单", "TC-A2-02/03/04"],
    ["03", "客户视图", "商家查看注册客户（不含密码）及购买历史", "TC-A2-05/06（3 个客户）"],
  ];
  s.addTable(rows, { x: 0.5, y: 1.25, w: 9, colW: [0.45, 1.45, 5.0, 2.1], rowH: 0.4, fontFace: FB, fontSize: 8.5, color: INK, valign: "middle", border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false });
  img(s, "10-customer-orders.png", 0.5, 2.92, 4.3, 1.95);
  s.addText("客户历史订单：状态 / 位次 / 口令码", { x: 0.5, y: 4.9, w: 4.3, h: 0.28, fontFace: FB, fontSize: 8.5, bold: true, color: GREEN_D, align: "center", margin: 0 });
  img(s, "12-seller-customers.png", 5.2, 2.92, 4.3, 1.95);
  s.addText("卖家客户管理：注册客户列表 + 购买历史入口", { x: 5.2, y: 4.9, w: 4.3, h: 0.28, fontFace: FB, fontSize: 8.5, bold: true, color: GREEN_D, align: "center", margin: 0 });
  pageNo(s, 5);
  s.addNotes("A.2 客户升级，三条：客户可以自由注册，填用户名、密码、电话和默认交易地点，用户名唯一、密码至少六位；登录后下单会自动关联账号，能在「我的订单」里看到历史下单；商家这边能看到所有注册客户的信息（不返回密码），还能按客户查购买历史。客户鉴权和卖家鉴权是两套独立的 token，互不干扰，原来的免注册下单也保留了。");
}

// ============ P6 A.1/A.2 升级验证与截图 ============
{
  const s = pres.addSlide();
  header(s, "重点二 · A.1 / A.2 升级验证", "2026-10-22 实测 · 12 项升级用例全过 · 7 张升级后截图", GREEN);
  stat(s, 0.5, 1.2, 2.15, 1.0, "12", "升级用例", GREEN);
  stat(s, 2.78, 1.2, 2.15, 1.0, "0", "失败", GREEN);
  stat(s, 5.06, 1.2, 2.15, 1.0, "7", "升级后截图", GREEN_D);
  stat(s, 7.34, 1.2, 2.15, 1.0, "4f2fde7", "实现提交", CLAY_D);
  img(s, "07-product-detail.png", 0.5, 2.5, 2.15, 1.7);
  img(s, "08-customer-register.png", 2.78, 2.5, 2.15, 1.7);
  img(s, "09-customer-login.png", 5.06, 2.5, 2.15, 1.7);
  img(s, "11-seller-products-v2.png", 7.34, 2.5, 2.15, 1.7);
  s.addText("商品详情：多图 + 富媒体 + 库存", { x: 0.5, y: 4.28, w: 2.15, h: 0.4, fontFace: FB, fontSize: 8.5, bold: true, color: GREEN_D, align: "center", margin: 0 });
  s.addText("客户注册", { x: 2.78, y: 4.28, w: 2.15, h: 0.4, fontFace: FB, fontSize: 8.5, bold: true, color: GREEN_D, align: "center", margin: 0 });
  s.addText("客户登录", { x: 5.06, y: 4.28, w: 2.15, h: 0.4, fontFace: FB, fontSize: 8.5, bold: true, color: GREEN_D, align: "center", margin: 0 });
  s.addText("卖家商品管理 v2（库存/分类/多图）", { x: 7.34, y: 4.28, w: 2.15, h: 0.4, fontFace: FB, fontSize: 8.5, bold: true, color: GREEN_D, align: "center", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.75, w: 9, h: 0.5, fill: { color: SAND } });
  s.addText("升级用例见《测试用例与运行说明》第八章（TC-A1-01~06 / TC-A2-01~06）；升级后界面截图 06~12 共 7 张。", { x: 0.72, y: 4.75, w: 8.6, h: 0.5, fontFace: FB, fontSize: 9.5, color: INK, valign: "middle", margin: 0 });
  pageNo(s, 6);
  s.addNotes("这一页是升级的量化证据。12 项升级用例 0 失败，7 张升级后截图。下面四张分别是商品详情（多图轮播、富媒体描述、库存）、客户注册、客户登录、卖家商品管理新版。加上前面两页的首页多商品列表、客户历史订单、卖家客户管理，七个升级界面全部覆盖。");
}

// ============ P7 接口测试（Sprint 1 基线） ============
{
  const s = pres.addSlide();
  header(s, "重点一 · 接口实例测试：14 项断言全部通过", "verify-api.ps1 · 0 失败 · 覆盖 TC-01 ~ TC-13（2026-10-21，升级前基线）", CLAY_D);
  stat(s, 0.5, 1.3, 2.15, 1.05, "14", "通过断言", GREEN);
  stat(s, 2.78, 1.3, 2.15, 1.05, "0", "失败", GREEN);
  stat(s, 5.06, 1.3, 2.15, 1.05, "13", "覆盖用例", CLAY);
  stat(s, 7.34, 1.3, 2.15, 1.05, "1", "核心交易链路", CLAY_D);
  card(s, 0.5, 2.6, 4.35, 2.05, CLAY, "覆盖链路（节选）", [
    "未登录访问卖家接口 → 401",
    "登录取 token → 读取在售商品",
    "已有在售时禁止发布第二件",
    "提交 3 条意向 → 位次 1/2/3",
  ], { bodySize: 9.8 });
  card(s, 5.15, 2.6, 4.35, 2.05, CLAY_D, "关键规则（节选）", [
    "非队首禁交易，队首交易自动冻结",
    "冻结期拒绝新的购买意向",
    "成交下架，其余意向离队",
    "口令码失效，卖家侧不可见",
  ], { bodySize: 9.8 });
  pageNo(s, 7);
  s.addNotes("下面是重点一，Sprint 1 基线复测。重新跑了 verify-api.ps1，14 个断言 0 失败，覆盖 TC-01 到 TC-13。左边是主链路，右边是几条最容易出错的规则。注意这个脚本是按「唯一在售」写的，A.1 升级后 TC-04 那条断言的语义已经变了，我们已把「产出多商品版自检脚本」列为遗留项。");
}

// ============ P8 买家端截图（基线） ============
{
  const s = pres.addSlide();
  header(s, "重点一 · 界面验证 · 买家端（基线）", "浏览器实拍 · 对应 TC-03（在售商品）与 TC-06（凭码查询）", CLAY);
  s.addImage({ path: IMG("01-home.png"), x: 0.5, y: 1.2, w: 4.3, h: 2.6875 });
  s.addImage({ path: IMG("02-track.png"), x: 5.2, y: 1.2, w: 4.3, h: 2.6875 });
  s.addText("买家端首页：唯一在售商品与购买入口", { x: 0.5, y: 3.95, w: 4.3, h: 0.28, fontFace: FB, fontSize: 10, bold: true, color: CLAY_D, align: "center", margin: 0 });
  s.addText("凭口令码查询排队位次", { x: 5.2, y: 3.95, w: 4.3, h: 0.28, fontFace: FB, fontSize: 10, bold: true, color: CLAY_D, align: "center", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.35, w: 9, h: 0.7, fill: { color: SAND } });
  s.addText("买家端只展示当前在售商品、不展示历史；提交意向即生成口令码，凭码可查位次、改信息、撤销。", { x: 0.72, y: 4.35, w: 8.6, h: 0.7, fontFace: FB, fontSize: 10, color: INK, valign: "middle", margin: 0 });
  pageNo(s, 8);
  s.addNotes("这是买家端的两张基线实拍。左边首页，全站只有这一件商品；右边是凭口令码查询页，输入码就能看到自己排第几位。买家全程不需要注册。注意这里的「唯一在售」是升级前的基线状态，升级后首页已变成多商品列表。");
}

// ============ P9 卖家端截图（基线） ============
{
  const s = pres.addSlide();
  header(s, "重点一 · 界面验证 · 卖家端（基线）", "登录 → 商品管理 → 意向管理 · 对应 TC-02 / 04 / 05-07 / 12", CLAY_D);
  s.addImage({ path: IMG("03-login.png"), x: 0.5, y: 1.2, w: 2.9, h: 1.8125 });
  s.addImage({ path: IMG("04-seller-dashboard.png"), x: 3.55, y: 1.2, w: 2.9, h: 1.8125 });
  s.addImage({ path: IMG("05-seller-intents.png"), x: 6.6, y: 1.2, w: 2.9, h: 1.8125 });
  s.addText("卖家登录", { x: 0.5, y: 3.08, w: 2.9, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: CLAY_D, align: "center", margin: 0 });
  s.addText("商品管理（单品单卖）", { x: 3.55, y: 3.08, w: 2.9, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: CLAY_D, align: "center", margin: 0 });
  s.addText("意向管理（排队 1/2/3）", { x: 6.6, y: 3.08, w: 2.9, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: CLAY_D, align: "center", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.5, w: 9, h: 1.2, fill: { color: SAND } });
  s.addText("意向管理里真实提交了 3 条测试意向（Buyer1/2/3），位次 1/2/3；界面明确提示「卖家端不展示口令码」——这是需求里很关键的一条隐私约束。", { x: 0.72, y: 3.5, w: 8.6, h: 1.2, fontFace: FB, fontSize: 10, color: INK, valign: "middle", margin: 0 });
  pageNo(s, 9);
  s.addNotes("卖家端三张基线截图：登录页、商品管理页、意向管理页。商品管理页能看到「单品单卖」的提示；意向管理页真实提交了三条意向，位次 1、2、3 清楚，而且界面特意标明卖家看不到买家的口令码。");
}

// ============ P10 演示视频 ============
{
  const s = pres.addSlide();
  header(s, "重点一 · 演示视频", "已通过 Git LFS 归档至仓库，可在 GitHub 直接观看", CLAY);
  card(s, 0.5, 1.3, 4.35, 2.2, CLAY, "视频信息", [
    "文件：docs/media/sprint1-demo.mp4",
    "大小：112.8 MB（Git LFS 托管）",
    "内容：完整走查核心交易闭环",
  ], { bodySize: 10.5 });
  card(s, 5.15, 1.3, 4.35, 2.2, CLAY_D, "观看方式", [
    "GitHub 仓库内直接打开播放",
    "或使用 media 直链下载 / 播放",
    "Wiki 第二次评审页已挂链接",
  ], { bodySize: 10.5 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.7, w: 9, h: 0.6, fill: { color: "2B2622" } });
  s.addText("https://github.com/kaskk345/pingxixi-online-shoppingplatform/blob/main/docs/media/sprint1-demo.mp4", { x: 0.68, y: 3.7, w: 8.6, h: 0.6, fontFace: "Consolas", fontSize: 8.5, color: SAGE, valign: "middle", margin: 0 });
  s.addText("同一链接已写入 GitHub Wiki「第 2 次阶段性评审报告」演示视频小节。", { x: 0.5, y: 4.45, w: 9, h: 0.35, fontFace: FB, fontSize: 10, color: MUTED, valign: "middle", margin: 0 });
  pageNo(s, 10);
  s.addNotes("除了截图，我们还录了一段完整的操作走查，用 Git LFS 传到仓库，约 112 MB。可以在 GitHub 直接点开看，或用这个链接。Wiki 的第二次评审页面也挂了同一个链接。");
}

// ============ P11 任务完成情况 ============
{
  const s = pres.addSlide();
  header(s, "任务完成情况（更新）", "新增 A.1 / A.2 实现与验证分工（按模块归属），基线复测补充", SAGE);
  const head = (t) => ({ text: t, options: { bold: true, fill: { color: "6B8E7B" }, color: WHITE } });
  const rows = [
    [head("完成人"), head("承担工作"), head("成果物")],
    ["方浩昱（后端②）", "A.1 商品模型与交易规则：库存/多图/二级分类字段、成交扣库存、归零自动下架、解除单品单卖", "Product.java / ProductService.java"],
    ["王则凯（后端①）", "A.1 接口层：商品发布/编辑/搜索、分类树与分类维护", "ProductController / CategoryController"],
    ["方浩昱（后端②）", "A.2 客户侧：Customer 实体、注册登录与 token 鉴权、意向关联、历史下单、商家客户视图", "Customer 系列 / CustomerInterceptor"],
    ["丁月诚（前端）", "首页多商品+搜索+分类、详情多图富媒体、客户注册/登录/订单、卖家商品/客户管理", "8 个 Vue 页面 / router"],
    ["方浩昱（测试执行）", "A.1/A.2 用例设计与实测 12 项全过、7 张升级后截图", "测试第八章 / screenshots 06~12"],
    ["何易（文档/组长）", "A.1/A.2 需求登记与状态更新，报告与 PPT 同步「已实现」", "本报告 / 讲述版 PPT"],
    ["方浩昱（测试执行）", "Sprint 1 基线复测：接口 14 项全过、5 张基线截图", "本报告第三章 / screenshots 01~05"],
    ["何易（文档/组长）", "测试说明新增界面截图章节，整理第二次评审报告", "测试用例第六章 / 本报告"],
  ];
  s.addTable(rows, { x: 0.5, y: 1.18, w: 9, colW: [1.7, 4.7, 2.6], rowH: 0.4, fontFace: FB, fontSize: 8, color: INK, valign: "middle", border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.85, w: 9, h: 0.45, fill: { color: SAND } });
  s.addText("口径：A.1/A.2 代码于 2026-10-22 合并在提交 4f2fde7 中（便于统一联调），上表按模块归属列示。", { x: 0.72, y: 4.85, w: 8.6, h: 0.45, fontFace: FB, fontSize: 8.5, color: INK, valign: "middle", margin: 0 });
  pageNo(s, 11);
  s.addNotes("任务完成情况。第一次评审的 15 项任务保持完成。这一轮新增的是 A.1、A.2 的实现与验证，按模块归属列了六行：方浩昱负责商品模型和客户侧后端，王则凯负责商品接口层，丁月诚负责前端八个页面，测试执行和 12 项用例、7 张截图由方浩昱完成，我负责需求登记、报告和 PPT。另外两行是基线的复测补充。代码合并在一次提交里，所以表里注明按模块归属。");
}

// ============ P12 遗留问题 ============
{
  const s = pres.addSlide();
  header(s, "遗留问题与风险", "均为增强项，不影响基线闭环与 A.1/A.2 主要验收", MUTED);
  const head = (t) => ({ text: t, options: { bold: true, fill: { color: MUTED }, color: WHITE } });
  const rows = [
    [head("类别"), head("现状"), head("影响")],
    ["买家端历史商品浏览页", "后端已归档，前端浏览页未实现", "买家无历史查看入口"],
    ["基线自检脚本版本", "verify-api.ps1 仍按「唯一在售」编写（TC-03/04）", "需多商品版脚本回归全链路"],
    ["数据统计看板", "接口已有，前端未接入", "无可视化统计"],
    ["意向终态命名", "VOID 与需求「失败」口径不一", "文档/接口需统一"],
    ["并发压测", "同商品并发提交 / 扣库存未压测", "高并发正确性未量化"],
    ["运行录屏", "已补 12 张截图，录屏尚未制作", "演示材料有缺口"],
  ];
  s.addTable(rows, { x: 0.5, y: 1.25, w: 9, colW: [2.3, 4.3, 2.4], rowH: 0.42, fontFace: FB, fontSize: 9.5, color: INK, valign: "middle", border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.35, w: 9, h: 0.8, fill: { color: SAND } });
  s.addText("这些项已写入第二次评审报告的「遗留问题与风险」表；其中「基线自检脚本多商品化」为下一迭代优先补齐的工程项。", { x: 0.72, y: 4.35, w: 8.6, h: 0.8, fontFace: FB, fontSize: 10.5, color: INK, valign: "middle", margin: 0 });
  pageNo(s, 12);
  s.addNotes("遗留项我如实列出，共六类：买家端历史浏览页没做、基线自检脚本需要多商品版、统计看板前端没接、意向终态命名要统一、并发没压测、录屏没做。它们都不影响基线闭环和 A.1、A.2 的主要验收，已写进第二次评审报告，后续按排期决定。");
}

// ============ P13 结论 ============
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.14, fill: { color: CLAY } });
  s.addText("评审结论", { x: 0.7, y: 0.42, w: 8.6, h: 0.55, fontFace: FT, fontSize: 26, bold: true, color: WHITE, valign: "middle", margin: 0 });

  const cols = [
    ["已达成", ["Sprint 1 八项目标全部达成", "单品单卖闭环实测通过", "卖家后台与鉴权", "免注册 + 口令码体系", "A.1 / A.2 升级已实现"], GREEN],
    ["验证证据", ["接口 14 项断言全过", "升级 12 项用例全过", "12 张界面实拍截图", "演示视频已归档", "第二次评审报告 + Wiki"], CLAY],
    ["后续关注", ["多商品版自检脚本", "买家端历史浏览页", "统计看板前端接入", "终态命名口径统一", "并发压测 / 运行录屏"], "8A6F47"],
  ];
  cols.forEach((c, i) => {
    const x = 0.7 + i * 2.95;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.75, h: 2.35, fill: { color: "3A332E" } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.75, h: 0.06, fill: { color: c[2] } });
    s.addText(c[0], { x: x + 0.18, y: 1.35, w: 2.4, h: 0.36, fontFace: FB, fontSize: 13, bold: true, color: c[2], valign: "middle", margin: 0 });
    s.addText(
      c[1].map((t, k) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: k < c[1].length - 1, paraSpaceAfter: 4 } })),
      { x: x + 0.18, y: 1.78, w: 2.4, h: 1.7, fontFace: FB, fontSize: 9.5, color: "D8D2C6", valign: "top", margin: 0 }
    );
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 3.9, w: 8.6, h: 0.9, fill: { color: "3A332E" } });
  s.addText(
    [{ text: "一句话总结：", options: { bold: true, color: CLAY } }, { text: "Sprint 1 单品单卖闭环已实测通过并正式收尾；A.1 / A.2 挑战升级已实现、联调、验证，商品侧与客户侧升级要求逐条可验证。", options: { color: "D8D2C6" } }],
    { x: 0.9, y: 3.9, w: 8.2, h: 0.9, fontFace: FB, fontSize: 11, valign: "middle", margin: 0 }
  );
  s.addText("感谢聆听 · 欢迎提问", { x: 0.7, y: 4.95, w: 8.6, h: 0.3, fontFace: FB, fontSize: 11, color: "A79E94", valign: "middle", margin: 0 });
  s.addNotes("最后总结。左边是已达成：Sprint 1 八项目标全部达成、单品单卖闭环实测通过，A.1、A.2 挑战升级已经实现。中间是证据：接口 14 项、升级 12 项、12 张截图、视频和报告。右边是后续要关注的五项，其中多商品版自检脚本优先。一句话：基线已收尾，挑战升级已落地，商品侧和客户侧的每条升级要求都能落到具体用例和截图上。谢谢大家，欢迎提问。");
}

const out = path.join(__dirname, process.argv[2] || "第二周_第二次评审_讲述版.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("OK ->", out)).catch((e) => { console.error("FAIL", e); process.exit(1); });
