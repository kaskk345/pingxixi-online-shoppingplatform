// 生成《第二周 · 第二次阶段性评审》讲述版 PPT（每页含演讲者备注讲稿）
// 运行： cmd /c "set NODE_PATH=C:\Users\yuanx\AppData\Roaming\npm\node_modules&& node build-week2-ppt.js"
const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "pingxixi 项目组";
pres.title = "第二周 · 第二次阶段性评审（讲述版）";

const INK = "2B2622", CLAY = "B85042", CLAY_D = "8E3B33", SAND = "E7E8D1";
const CREAM = "FBF8F3", SAGE = "A7BEAE", MUTED = "8A8178", WHITE = "FFFFFF";
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

// ============ P1 封面 ============
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.5, h: H, fill: { color: CLAY } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.95, y: 1.1, w: 0.13, h: 2.2, fill: { color: SAGE } });
  s.addText("第二周 · 第二次阶段性评审", { x: 1.3, y: 1.05, w: 8.2, h: 0.8, fontFace: FT, fontSize: 34, bold: true, color: WHITE, margin: 0, valign: "middle" });
  s.addText("在线购物系统（挑战升级）· 单品单卖直销系统", { x: 1.3, y: 1.9, w: 8.2, h: 0.5, fontFace: FB, fontSize: 17, color: SAND, margin: 0, valign: "middle" });
  s.addText("Sprint 1 收尾复测 · 讲述版", { x: 1.3, y: 2.45, w: 8.2, h: 0.4, fontFace: FB, fontSize: 15, bold: true, color: "E9A292", margin: 0, valign: "middle" });
  s.addText("接口 14 项断言全部通过 · 5 张界面截图 · 演示视频已归档", { x: 1.3, y: 2.95, w: 8.4, h: 0.35, fontFace: FB, fontSize: 11.5, color: "B9B2A8", margin: 0, valign: "middle" });
  s.addText("软件工程课程设计 · 第 4 组　|　2026-10-22", { x: 1.3, y: 4.7, w: 8, h: 0.3, fontFace: FB, fontSize: 10.5, color: "A79E94", margin: 0, valign: "middle" });
  s.addNotes("各位老师、同学好，我是第 4 组的何易。今天由我代表小组汇报第二周的进展，也就是第二次阶段性评审。这一周我们主要做了两件事：第一，把 Sprint 1 的交付物在真实运行环境下重新复测了一遍；第二，补齐界面截图和演示视频，作为可验证的证据。");
}

// ============ P2 评审概览 ============
{
  const s = pres.addSlide();
  header(s, "本周评审概览", "Sprint 1 已交付，本周对运行态做复测与证据补齐", CLAY);
  card(s, 0.5, 1.3, 4.35, 2.45, CLAY, "评审依据", [
    "后端 Spring Boot（:8080）与前端 Vue（:5173）重新拉起",
    "运行接口自检脚本 verify-api.ps1",
    "浏览器自动化对关键页面截图",
    "核对测试报告与端到端验证记录",
  ], { bodySize: 10.5 });
  card(s, 5.15, 1.3, 4.35, 2.45, CLAY_D, "本周目标", [
    "确认 Sprint 1 闭环在当前环境仍可复现",
    "用接口测试给出量化结论",
    "用界面截图与视频补齐演示证据",
    "梳理遗留项，为后续排期提供依据",
  ], { bodySize: 10.5 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.0, w: 9, h: 0.85, fill: { color: SAND } });
  s.addText(
    [{ text: "一句话：", options: { bold: true } }, { text: "这一周不是新做功能，而是把「已交付的东西」用可复现、可验证的方式证明一遍。" }],
    { x: 0.72, y: 4.0, w: 8.6, h: 0.85, fontFace: FB, fontSize: 11, color: INK, valign: "middle", margin: 0 }
  );
  pageNo(s, 2);
  s.addNotes("先说本周的定位。Sprint 1 的功能在上一周已经交付，这一周我们不再新增功能，而是做复测和证据补齐。评审依据有四项：把前后端重新跑起来、执行接口自检脚本、用浏览器截关键页面、再核对之前的测试报告和端到端记录。目标就是证明：交付物在今天的机器上仍然能完整跑通。");
}

// ============ P3 目标达成 ============
{
  const s = pres.addSlide();
  header(s, "迭代目标达成情况", "对照 Sprint 1 八项目标：全部达成", SAGE);
  const head = (t) => ({ text: t, options: { bold: true, fill: { color: CLAY }, color: WHITE } });
  const rows = [
    [head("#"), head("目标"), head("状态"), head("验证证据")],
    ["1", "单品单卖：同一时刻最多 1 件在售", "已达成", "TC-04"],
    ["2", "商品四态状态机", "已达成", "TC-08 / 10 / 11"],
    ["3", "买家免注册提交意向", "已达成", "TC-03 / 05"],
    ["4", "口令码机制（查询/改信息/撤销/失效）", "已达成", "TC-05 / 12 / 13"],
    ["5", "先到先得队列", "已达成", "TC-06 / 07"],
    ["6", "交易结果登记", "已达成", "TC-10 / 11 / 12"],
    ["7", "卖家后台（登录/管理/改密/上传）", "已达成", "TC-01 / 02 + 截图"],
    ["8", "回归基线（移除购物车与订单）", "已达成", "截图 01 / 04"],
  ];
  s.addTable(rows, { x: 0.5, y: 1.3, w: 9, colW: [0.5, 4.4, 1.1, 3.0], rowH: 0.31, fontFace: FB, fontSize: 10, color: INK, valign: "middle", border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.5, w: 9, h: 0.6, fill: { color: SAND } });
  s.addText(
    [{ text: "结论：", options: { bold: true } }, { text: "8 项目标 100% 达成，核心链路端到端符合预期。" }],
    { x: 0.72, y: 4.5, w: 8.6, h: 0.6, fontFace: FB, fontSize: 11, color: INK, valign: "middle", margin: 0 }
  );
  pageNo(s, 3);
  s.addNotes("这是 Sprint 1 定下的八项目标，我们逐条对照。可以看到全部是「已达成」，右边是对应的验证证据编号。我想强调，这不是凭感觉打勾，每一条都能落到具体的测试用例或者截图上。");
}

// ============ P4 接口测试 ============
{
  const s = pres.addSlide();
  header(s, "接口实例测试：14 项断言全部通过", "verify-api.ps1 · 0 失败 · 覆盖 TC-01 ~ TC-13", CLAY_D);
  stat(s, 0.5, 1.3, 2.15, 1.05, "14", "通过断言", "6B8E7B");
  stat(s, 2.78, 1.3, 2.15, 1.05, "0", "失败", "6B8E7B");
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
  pageNo(s, 4);
  s.addNotes("接口是我最看重的证据。我们重新跑了 verify-api.ps1，一共 14 个断言，0 失败，覆盖 TC-01 到 TC-13 十三个用例。左边是主链路的覆盖，右边是几条最容易出错的规则：非队首不能交易、冻结期不能再收新意向、成交后口令码必须失效。这些都实测通过。");
}

// ============ P5 买家端截图 ============
{
  const s = pres.addSlide();
  header(s, "界面验证 · 买家端", "浏览器实拍 · 对应 TC-03（在售商品）与 TC-06（凭码查询）", CLAY);
  s.addImage({ path: IMG("01-home.png"), x: 0.5, y: 1.2, w: 4.3, h: 2.6875 });
  s.addImage({ path: IMG("02-track.png"), x: 5.2, y: 1.2, w: 4.3, h: 2.6875 });
  s.addText("买家端首页：唯一在售商品与购买入口", { x: 0.5, y: 3.95, w: 4.3, h: 0.28, fontFace: FB, fontSize: 10, bold: true, color: CLAY_D, align: "center", margin: 0 });
  s.addText("凭口令码查询排队位次", { x: 5.2, y: 3.95, w: 4.3, h: 0.28, fontFace: FB, fontSize: 10, bold: true, color: CLAY_D, align: "center", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.35, w: 9, h: 0.7, fill: { color: SAND } });
  s.addText("买家端只展示当前在售商品、不展示历史；提交意向即生成口令码，凭码可查位次、改信息、撤销。", { x: 0.72, y: 4.35, w: 8.6, h: 0.7, fontFace: FB, fontSize: 10, color: INK, valign: "middle", margin: 0 });
  pageNo(s, 5);
  s.addNotes("这是买家端的两张实拍。左边首页，全站只有这一件商品，价格、库存、购买入口都在；右边是凭口令码查询页，输入码就能看到自己排第几位。买家全程不需要注册。");
}

// ============ P6 卖家端截图 ============
{
  const s = pres.addSlide();
  header(s, "界面验证 · 卖家端", "登录 → 商品管理 → 意向管理 · 对应 TC-02 / 04 / 05-07 / 12", CLAY_D);
  s.addImage({ path: IMG("03-login.png"), x: 0.5, y: 1.2, w: 2.9, h: 1.8125 });
  s.addImage({ path: IMG("04-seller-dashboard.png"), x: 3.55, y: 1.2, w: 2.9, h: 1.8125 });
  s.addImage({ path: IMG("05-seller-intents.png"), x: 6.6, y: 1.2, w: 2.9, h: 1.8125 });
  s.addText("卖家登录", { x: 0.5, y: 3.08, w: 2.9, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: CLAY_D, align: "center", margin: 0 });
  s.addText("商品管理（单品单卖）", { x: 3.55, y: 3.08, w: 2.9, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: CLAY_D, align: "center", margin: 0 });
  s.addText("意向管理（排队 1/2/3）", { x: 6.6, y: 3.08, w: 2.9, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: CLAY_D, align: "center", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.5, w: 9, h: 1.2, fill: { color: SAND } });
  s.addText("意向管理里真实提交了 3 条测试意向（Buyer1/2/3），位次 1/2/3；界面明确提示「卖家端不展示口令码」——这是需求里很关键的一条隐私约束。", { x: 0.72, y: 3.5, w: 8.6, h: 1.2, fontFace: FB, fontSize: 10, color: INK, valign: "middle", margin: 0 });
  pageNo(s, 6);
  s.addNotes("卖家端三张：登录页、商品管理页、意向管理页。商品管理页能看到「单品单卖，同一时刻仅允许 1 件在售」的提示；意向管理页里我真实提交了三条意向，位次 1、2、3 很清楚，而且界面特意标明卖家看不到买家的口令码。");
}

// ============ P7 演示视频 ============
{
  const s = pres.addSlide();
  header(s, "演示视频", "已通过 Git LFS 归档至仓库，可在 GitHub 直接观看", CLAY);
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
  s.addText("同一链接已写入 GitHub Wiki「第 2 次阶段性评审报告」2.3 节。", { x: 0.5, y: 4.45, w: 9, h: 0.35, fontFace: FB, fontSize: 10, color: MUTED, valign: "middle", margin: 0 });
  pageNo(s, 7);
  s.addNotes("除了截图，我们还录了一段完整的操作走查，已经用 Git LFS 传到仓库，大约 112 MB。大家可以在 GitHub 里直接点开看，或者用下面这个链接。Wiki 的第二次评审页面里也挂了同一个链接。");
}

// ============ P8 任务完成情况 ============
{
  const s = pres.addSlide();
  header(s, "任务完成情况（更新）", "第一次评审 15 项任务已完成，本次补充验证工作", SAGE);
  const head = (t) => ({ text: t, options: { bold: true, fill: { color: "6B8E7B" }, color: WHITE } });
  const rows = [
    [head("完成人"), head("本次补充工作"), head("成果物")],
    ["方浩昱（测试）", "对运行态复测接口自检，输出 14 项全过结论；补充 5 张 UI 截图", "本报告、docs/wiki/screenshots/"],
    ["何易（文档/组长）", "在测试说明中新增界面截图章节；整理第二次评审报告与 Wiki 页", "测试用例与运行说明（第六章）、本报告"],
  ];
  s.addTable(rows, { x: 0.5, y: 1.35, w: 9, colW: [1.9, 4.3, 2.8], rowH: 0.6, fontFace: FB, fontSize: 10, color: INK, valign: "middle", border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.35, w: 9, h: 0.8, fill: { color: SAND } });
  s.addText(
    [{ text: "口径说明：", options: { bold: true } }, { text: "本周为 Sprint 1 收尾验证，不新增功能点；已交付的 15 项任务维持完成状态。" }],
    { x: 0.72, y: 3.35, w: 8.6, h: 0.8, fontFace: FB, fontSize: 10.5, color: INK, valign: "middle", margin: 0 }
  );
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.3, w: 9, h: 0.7, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
  s.addText("补充产出：5 张界面截图、1 段演示视频（LFS）、第 2 次评审报告（仓库 + Wiki）。", { x: 0.72, y: 4.3, w: 8.6, h: 0.7, fontFace: FB, fontSize: 10, color: "4A423C", valign: "middle", margin: 0 });
  pageNo(s, 8);
  s.addNotes("任务完成情况：第一次评审的 15 项任务都保持完成状态。这一周额外补了两类工作，测试同学负责复测和截图，我负责文档、报告和 Wiki 页面。产出包括 5 张截图、1 段视频和这份第二次评审报告。");
}

// ============ P9 遗留问题 ============
{
  const s = pres.addSlide();
  header(s, "遗留问题与风险", "均为增强项，不影响核心闭环交付", MUTED);
  const head = (t) => ({ text: t, options: { bold: true, fill: { color: MUTED }, color: WHITE } });
  const rows = [
    [head("类别"), head("现状"), head("影响")],
    ["历史商品浏览页", "后端已归档，前端浏览页未实现", "无历史查看入口"],
    ["数据统计看板", "接口已有，前端未接入", "无可视化统计"],
    ["意向终态命名", "VOID 与需求「失败」口径不一", "文档/接口需统一"],
    ["并发压测", "同商品并发提交/冻结未压测", "高并发正确性未量化"],
    ["运行录屏", "已补 5 张截图，录屏尚未制作", "演示材料有缺口"],
  ];
  s.addTable(rows, { x: 0.5, y: 1.3, w: 9, colW: [2.1, 4.5, 2.4], rowH: 0.42, fontFace: FB, fontSize: 10, color: INK, valign: "middle", border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.1, w: 9, h: 0.8, fill: { color: SAND } });
  s.addText("这些项已写入第二次评审报告的「遗留问题与风险」表，后续是否纳入下一迭代以实际排期为准。", { x: 0.72, y: 4.1, w: 8.6, h: 0.8, fontFace: FB, fontSize: 10.5, color: INK, valign: "middle", margin: 0 });
  pageNo(s, 9);
  s.addNotes("遗留项我如实列出，一共五类：历史浏览页前端没做、统计看板接口有但前端没接、口令码终态命名口径要统一、并发没压测、录屏没做。它们都不影响核心闭环，已经写进第二次评审报告，后续按排期决定。");
}

// ============ P10 挑战升级（已实现） ============
{
  const s = pres.addSlide();
  header(s, "挑战升级（A.1 / A.2）· 已实现", "2026-10-22 完成实现并通过接口联调（提交 4f2fde7）", "6B8E7B");
  card(s, 0.5, 1.3, 4.35, 2.5, "6B8E7B", "A.1 商品管理升级（已实现）", [
    "支持同时发布多个商品",
    "商品支持 2 级类别管理",
    "每种商品有库存，库存为 0 自动下架",
    "可浏览 + 搜索两种方式查找",
    "多张商品图片，描述支持富媒体",
  ], { bodySize: 10 });
  card(s, 5.15, 1.3, 4.35, 2.5, "6B8E7B", "A.2 客户升级（已实现）", [
    "客户自由注册：用户名 / 密码 / 电话 / 默认交易地点",
    "客户登录后可查看历史下单记录",
    "商家可查看所有注册客户信息",
    "商家可查看客户的购买历史",
  ], { bodySize: 10 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.0, w: 9, h: 0.85, fill: { color: SAND } });
  s.addText("实现要点：新增 Category / Customer 实体与客户鉴权；成交扣减库存、库存归零自动下架；首页多商品列表 + 搜索 + 两级分类；详情页多图轮播 + 富媒体；客户注册登录与历史订单；商家客户管理。", { x: 0.72, y: 4.0, w: 8.6, h: 0.85, fontFace: FB, fontSize: 9.5, color: INK, valign: "middle", margin: 0 });
  pageNo(s, 10);
  s.addNotes("这一页是课程的挑战升级，现在两项都已完成实现并通过接口联调，提交号 4f2fde7。A.1 商品管理：从单品单卖升级为多商品、二级分类、真实库存、浏览加搜索、多图和富媒体描述，成交会扣库存，库存归零自动下架。A.2 客户升级：买家可注册账号、查看历史下单，商家也能查看客户和购买历史。");
}

// ============ P11 结论 ============
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.14, fill: { color: CLAY } });
  s.addText("评审结论", { x: 0.7, y: 0.42, w: 8.6, h: 0.55, fontFace: FT, fontSize: 26, bold: true, color: WHITE, valign: "middle", margin: 0 });

  const cols = [
    ["已达成", ["单品单卖与四态状态机", "免注册 + 口令码体系", "先到先得队列与冻结", "成交下架 / 失败恢复", "卖家后台与鉴权"], "6B8E7B"],
    ["验证证据", ["接口 14 项断言全过", "5 张界面实拍截图", "演示视频已归档", "第二次评审报告", "Wiki 页面已上线"], CLAY],
    ["后续关注", ["历史浏览页前端", "统计看板前端接入", "终态命名口径统一", "并发压测", "运行录屏"], "8A6F47"],
  ];
  cols.forEach((c, i) => {
    const x = 0.7 + i * 2.95;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.75, h: 2.25, fill: { color: "3A332E" } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.75, h: 0.06, fill: { color: c[2] } });
    s.addText(c[0], { x: x + 0.18, y: 1.35, w: 2.4, h: 0.36, fontFace: FB, fontSize: 13, bold: true, color: c[2], valign: "middle", margin: 0 });
    s.addText(
      c[1].map((t, k) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: k < c[1].length - 1, paraSpaceAfter: 5 } })),
      { x: x + 0.18, y: 1.8, w: 2.4, h: 1.55, fontFace: FB, fontSize: 10, color: "D8D2C6", valign: "top", margin: 0 }
    );
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.0, w: 8.6, h: 0.8, fill: { color: "3A332E" } });
  s.addText(
    [{ text: "一句话总结：", options: { bold: true, color: CLAY } }, { text: "Sprint 1 的单品单卖闭环已完整实现并实测通过，八项目标全部达成，本周以复测与证据补齐正式收尾。", options: { color: "D8D2C6" } }],
    { x: 0.9, y: 4.0, w: 8.2, h: 0.8, fontFace: FB, fontSize: 11.5, valign: "middle", margin: 0 }
  );
  s.addText("感谢聆听 · 欢迎提问", { x: 0.7, y: 4.95, w: 8.6, h: 0.3, fontFace: FB, fontSize: 11, color: "A79E94", valign: "middle", margin: 0 });
  s.addNotes("最后做个结论。左边是已经达成的能力，中间是支撑结论的证据：14 项接口断言、5 张截图、视频和报告；右边是后续要关注的五项。一句话总结：Sprint 1 的单品单卖闭环已经完整实现、实测通过，八项目标全部达成，本周以复测和证据补齐正式收尾。我的汇报到这里，谢谢大家，欢迎提问。");
}

const out = path.join(__dirname, "第二周_第二次评审_讲述版.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("OK ->", out)).catch((e) => { console.error("FAIL", e); process.exit(1); });
