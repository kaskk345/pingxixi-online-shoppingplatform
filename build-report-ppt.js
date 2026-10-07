// 生成《在线购物系统（挑战升级）》阶段汇报 PPT（五人分工版）
// 运行： $env:NODE_PATH="C:\Users\yuanx\AppData\Roaming\npm\node_modules"; node build-report-ppt.js
const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.author = "pingxixi 项目组";
pres.title = "在线购物系统（挑战升级）阶段汇报";

// ---------- 主题 ----------
const INK = "2B2622";
const CLAY = "B85042";
const CLAY_D = "8E3B33";
const SAND = "E7E8D1";
const CREAM = "FBF8F3";
const SAGE = "A7BEAE";
const MUTED = "8A8178";
const WHITE = "FFFFFF";

const FT = "Microsoft YaHei";
const FB = "Microsoft YaHei";
const W = 10, H = 5.625;

const ROLES = [
  { no: "01", name: "前端开发", tag: "前端", color: CLAY, pages: "P3–P5", desc: "页面与交互\n· 技术选型与工程结构\n· 买家端与卖家端页面\n· 状态驱动 UI 与口令码" },
  { no: "02", name: "后端开发①", tag: "后端①", color: CLAY_D, pages: "P6–P8", desc: "接口与认证\n· 分层架构与统一规范\n· 卖家登录与 X-Token\n· 商品与意向接口清单" },
  { no: "03", name: "后端开发②", tag: "后端②", color: "6B8E7B", pages: "P9–P11", desc: "领域模型与状态\n· 数据模型与三套枚举\n· 商品四态状态机\n· 先到先得队列与口令码" },
  { no: "04", name: "测试", tag: "测试", color: "4F6D7A", pages: "P12–P14", desc: "质量保障\n· 测试策略与完成定义\n· 接口与端到端验证\n· 并发异常与规则校验" },
  { no: "05", name: "文档 / UI", tag: "文档", color: "8A6F47", pages: "P15–P18", desc: "文档与演示\n· 文档体系与工作量\n· 功能结构图与用例图\n· 业务流程图 / 部署演示" },
];

const shadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.1 });

function pageNo(slide, n) {
  slide.addText(String(n), {
    x: 9.2, y: 5.05, w: 0.5, h: 0.28, fontFace: FB, fontSize: 9,
    color: MUTED, align: "right", valign: "middle", margin: 0,
  });
}

function header(slide, role, title, sub) {
  slide.background = { color: CREAM };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.09, fill: { color: role.color } });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 0.34, w: 1.15, h: 0.3, fill: { color: role.color } });
  slide.addText(role.name, {
    x: 0.5, y: 0.34, w: 1.15, h: 0.3, fontFace: FB, fontSize: 10, bold: true,
    color: WHITE, align: "center", valign: "middle", margin: 0,
  });
  slide.addText(title, {
    x: 1.78, y: 0.28, w: 6.7, h: 0.44, fontFace: FT, fontSize: 22, bold: true,
    color: INK, align: "left", valign: "middle", margin: 0,
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.5, y: 0.78, w: 8.6, h: 0.32, fontFace: FB, fontSize: 11,
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
    x: x + 0.22, y: y + 0.12, w: w - 0.36, h: 0.28, fontFace: FB,
    fontSize: opt.titleSize || 12.5, bold: true, color: INK, valign: "middle", margin: 0,
  });
  if (lines && lines.length) {
    slide.addText(
      lines.map((t, i) => ({ text: t, options: { breakLine: i < lines.length - 1, bullet: { code: "2022" }, paraSpaceAfter: 3 } })),
      {
        x: x + 0.22, y: y + 0.44, w: w - 0.36, h: h - 0.58, fontFace: FB,
        fontSize: opt.bodySize || 10, color: "4A423C", valign: "top", margin: 0, lineSpacingMultiple: 1.05,
      }
    );
  }
}

function stepCard(slide, x, y, w, h, color, no, title, lines) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow(),
  });
  slide.addShape(pres.shapes.OVAL, { x: x + 0.18, y: y + 0.16, w: 0.36, h: 0.36, fill: { color } });
  slide.addText(no, {
    x: x + 0.18, y: y + 0.16, w: 0.36, h: 0.36, fontFace: FB, fontSize: 10, bold: true,
    color: WHITE, align: "center", valign: "middle", margin: 0,
  });
  slide.addText(title, {
    x: x + 0.62, y: y + 0.16, w: w - 0.8, h: 0.36, fontFace: FB, fontSize: 12, bold: true,
    color: INK, valign: "middle", margin: 0,
  });
  slide.addText(
    lines.map((t, i) => ({ text: t, options: { breakLine: i < lines.length - 1, paraSpaceAfter: 2 } })),
    {
      x: x + 0.2, y: y + 0.6, w: w - 0.38, h: h - 0.72, fontFace: FB, fontSize: 9.5,
      color: "4A423C", valign: "top", margin: 0,
    }
  );
}

function stat(slide, x, y, w, h, num, label, color) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow(),
  });
  slide.addText(num, {
    x, y: y + 0.08, w, h: 0.6, fontFace: FT, fontSize: 30, bold: true,
    color, align: "center", valign: "middle", margin: 0,
  });
  slide.addText(label, {
    x, y: y + 0.62, w, h: 0.3, fontFace: FB, fontSize: 9.5,
    color: MUTED, align: "center", valign: "middle", margin: 0,
  });
}

function arrowRight(slide, x, y, w, color) { slide.addShape(pres.shapes.RIGHT_ARROW, { x, y, w, h: 0.17, fill: { color } }); }
function arrowDown(slide, x, y, h, color) { slide.addShape(pres.shapes.DOWN_ARROW, { x, y, w: 0.17, h, fill: { color } }); }
function arrowLeft(slide, x, y, w, color) { slide.addShape(pres.shapes.LEFT_ARROW, { x, y, w, h: 0.17, fill: { color } }); }
function arrowUp(slide, x, y, h, color) { slide.addShape(pres.shapes.UP_ARROW, { x, y, w: 0.17, h, fill: { color } }); }
function node(slide, x, y, w, h, text, color, fillColor) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: fillColor || WHITE }, line: { color, width: 1.5 }, shadow: shadow(),
  });
  slide.addText(text, {
    x, y, w, h, fontFace: FB, fontSize: 11.5, bold: true, color: color === WHITE ? INK : color,
    align: "center", valign: "middle", margin: 0,
  });
}
function edgeLabel(slide, x, y, w, text) {
  slide.addText(text, {
    x, y, w, h: 0.24, fontFace: FB, fontSize: 8.5, color: MUTED, align: "center", valign: "middle", margin: 0,
  });
}

const IMG_DIR = __dirname;

// =====================================================================
// P1 封面
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.5, h: H, fill: { color: CLAY } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.95, y: 1.15, w: 0.13, h: 2.1, fill: { color: SAGE } });

  s.addText("在线购物系统", {
    x: 1.3, y: 1.1, w: 8, h: 0.75, fontFace: FT, fontSize: 40, bold: true,
    color: WHITE, valign: "middle", margin: 0,
  });
  s.addText("（挑战升级）· 单品单卖直销系统", {
    x: 1.3, y: 1.85, w: 8, h: 0.5, fontFace: FB, fontSize: 20, color: SAND, valign: "middle", margin: 0,
  });
  s.addText("阶段汇报 · 五人分工", {
    x: 1.3, y: 2.4, w: 8, h: 0.4, fontFace: FB, fontSize: 15, color: "E9A292", bold: true, valign: "middle", margin: 0,
  });
  s.addText("唯一一件在售商品 · 卖家单一账号 · 买家免注册凭口令码 · 线下交易 · 先到先得排队", {
    x: 1.3, y: 2.95, w: 8.2, h: 0.35, fontFace: FB, fontSize: 11.5, color: "B9B2A8", valign: "middle", margin: 0,
  });

  let x = 1.3;
  ROLES.forEach((r) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 3.65, w: 1.42, h: 0.34, fill: { color: r.color } });
    s.addText(r.tag, {
      x, y: 3.65, w: 1.42, h: 0.34, fontFace: FB, fontSize: 10.5, bold: true,
      color: WHITE, align: "center", valign: "middle", margin: 0,
    });
    x += 1.5;
  });

  s.addText("软件工程课程设计 · Scrum 迭代开发　|　2026-10-07", {
    x: 1.3, y: 4.75, w: 8, h: 0.3, fontFace: FB, fontSize: 10.5, color: "A79E94", valign: "middle", margin: 0,
  });
}

// =====================================================================
// P2 分工总览
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.09, fill: { color: CLAY } });
  s.addText("本次汇报怎么分工", {
    x: 0.5, y: 0.3, w: 6, h: 0.5, fontFace: FT, fontSize: 24, bold: true, color: INK, valign: "middle", margin: 0,
  });
  s.addText("五位成员按冲刺订单的认领任务，各自汇报负责部分的搭建情况", {
    x: 0.5, y: 0.85, w: 9, h: 0.3, fontFace: FB, fontSize: 11, color: MUTED, valign: "middle", margin: 0,
  });

  ROLES.forEach((r, i) => {
    const x = 0.45 + i * 1.83, w = 1.72, y = 1.45, h = 2.15;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w, h, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.5, fill: { color: r.color } });
    s.addText(r.no, {
      x: x + 0.12, y, w: 0.5, h: 0.5, fontFace: FT, fontSize: 16, bold: true,
      color: WHITE, align: "left", valign: "middle", margin: 0,
    });
    s.addText(r.name, {
      x: x + 0.5, y, w: w - 0.6, h: 0.5, fontFace: FB, fontSize: 12.5, bold: true,
      color: WHITE, align: "right", valign: "middle", margin: 0,
    });
    const lines = r.desc.split("\n");
    s.addText(
      lines.map((t, k) => ({
        text: t,
        options: { breakLine: k < lines.length - 1, bold: k === 0, color: k === 0 ? INK : "4A423C", fontSize: k === 0 ? 10.5 : 9.5, paraSpaceAfter: 3 },
      })),
      { x: x + 0.16, y: y + 0.62, w: w - 0.32, h: h - 0.78, fontFace: FB, valign: "top", margin: 0 }
    );
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.45, y: 3.85, w: 9.1, h: 0.72, fill: { color: SAND } });
  s.addText(
    [
      { text: "本阶段目标：", options: { bold: true } },
      { text: "把「单品单卖」基线真正落地——全站同一时刻只有一件在售商品，买家免注册凭口令码排队，卖家按先到先得推进交易并登记结果" },
    ],
    { x: 0.7, y: 3.85, w: 8.6, h: 0.72, fontFace: FB, fontSize: 11, color: INK, valign: "middle", margin: 0 }
  );
  pageNo(s, 2);
}

// =====================================================================
// 前端 P3–P5
// =====================================================================
{
  const s = pres.addSlide();
  header(s, ROLES[0], "前端技术选型与工程结构", "买家端与卖家后台同属一个 Vue 3 工程，共用 axios 拦截与路由守卫");

  card(s, 0.5, 1.35, 4.3, 2.05, ROLES[0].color, "技术栈", [
    "Vue 3 + Vite 5：前端端口 5173，热更新",
    "Element Plus：表单、弹窗、上传、标签",
    "Vue Router：买家端与 /seller 后台双区",
    "Axios：统一 /api，自动带上 X-Token",
  ], { bodySize: 10 });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.05, y: 1.35, w: 4.45, h: 2.05, fill: { color: "2B2622" }, line: { color: "2B2622", width: 0.75 },
  });
  s.addText("frontend/src", {
    x: 5.25, y: 1.45, w: 4, h: 0.28, fontFace: "Consolas", fontSize: 11, bold: true, color: SAGE, margin: 0,
  });
  s.addText(
    [
      { text: "├── api/       请求封装 + 401 拦截", options: { breakLine: true } },
      { text: "├── router/    路由 + 卖家页登录守卫", options: { breakLine: true } },
      { text: "├── utils/     status.js 状态中文映射", options: { breakLine: true } },
      { text: "├── views/     Home 单品橱窗", options: { breakLine: true } },
      { text: "│              Track 凭码查询", options: { breakLine: true } },
      { text: "│              ProductDetail / Login", options: { breakLine: true } },
      { text: "└── seller/    ProductManage · IntentManage", options: { breakLine: true } },
      { text: "               Password", options: {} },
    ],
    { x: 5.25, y: 1.78, w: 4.1, h: 1.55, fontFace: "Consolas", fontSize: 9.5, color: "D8D2C6", margin: 0 }
  );

  stat(s, 0.5, 3.6, 2.9, 1.0, "8", "前端页面（含 3 个卖家页）", ROLES[0].color);
  stat(s, 3.55, 3.6, 2.9, 1.0, "4", "买家端页面（免注册）", CLAY_D);
  stat(s, 6.6, 3.6, 2.9, 1.0, "1", "当前唯一在售商品", "6B8E7B");
  pageNo(s, 3);
}

{
  const s = pres.addSlide();
  header(s, ROLES[0], "已实现的页面", "买家侧围绕「看商品 → 提意向 → 凭码管理」，卖家侧围绕「管商品 → 推队列」");

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.3, w: 4.3, h: 0.36, fill: { color: CLAY } });
  s.addText("买家端（无需注册）", {
    x: 0.62, y: 1.3, w: 4.1, h: 0.36, fontFace: FB, fontSize: 12, bold: true, color: WHITE, valign: "middle", margin: 0,
  });
  stepCard(s, 0.5, 1.78, 4.3, 0.92, CLAY, "1", "Home 单品橱窗", ["展示唯一在售商品：大图、描述、价格、状态"]);
  stepCard(s, 0.5, 2.8, 4.3, 0.92, CLAY, "2", "Track 凭码查询", ["查排队位次、改姓名电话、撤销意向"]);
  stepCard(s, 0.5, 3.82, 4.3, 0.92, CLAY, "3", "ProductDetail 详情", ["商品图文信息，可直接提交购买意向"]);

  s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.3, w: 4.3, h: 0.36, fill: { color: CLAY_D } });
  s.addText("卖家后台（/seller，需登录）", {
    x: 5.32, y: 1.3, w: 4.1, h: 0.36, fontFace: FB, fontSize: 12, bold: true, color: WHITE, valign: "middle", margin: 0,
  });
  stepCard(s, 5.2, 1.78, 4.3, 0.92, CLAY_D, "1", "ProductManage 商品管理", ["发布、编辑、冻结、解冻、手动下架"]);
  stepCard(s, 5.2, 2.8, 4.3, 0.92, CLAY_D, "2", "IntentManage 意向管理", ["先到先得队列，开始交易与登记结果"]);
  stepCard(s, 5.2, 3.82, 4.3, 0.92, CLAY_D, "3", "Password 修改密码", ["校验原密码，修改后旧会话失效"]);
  pageNo(s, 4);
}

{
  const s = pres.addSlide();
  header(s, ROLES[0], "前端难点与下一步", "状态驱动 UI 与口令码交互是这一阶段新增的两个难点");

  card(s, 0.5, 1.35, 2.9, 2.1, CLAY, "① 状态驱动 UI", [
    "商品四态决定按钮可用性与文案",
    "utils/status.js 集中管理中文映射",
  ]);
  card(s, 3.55, 1.35, 2.9, 2.1, CLAY_D, "② 口令码交互", [
    "提交后弹出口令码并提示保存",
    "自动跳转查询页，凭码看排队位次",
  ]);
  card(s, 6.6, 1.35, 2.9, 2.1, "6B8E7B", "③ 登录态与上传", [
    "路由守卫校验 /seller 访问权限",
    "图片上传后回显预览",
  ]);

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.7, w: 9, h: 1.0, fill: { color: SAND } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.7, w: 0.07, h: 1.0, fill: { color: CLAY } });
  s.addText("下一步", {
    x: 0.72, y: 3.8, w: 2.2, h: 0.3, fontFace: FB, fontSize: 12, bold: true, color: CLAY_D, margin: 0,
  });
  s.addText(
    [
      { text: "评价管理与营销位展示", options: { breakLine: true } },
      { text: "历史商品只读浏览页（含意向人列表）", options: { breakLine: true } },
      { text: "移动端自适应，为微信小程序端做准备", options: {} },
    ],
    { x: 3.0, y: 3.78, w: 6.3, h: 0.85, fontFace: FB, fontSize: 10.5, color: INK, valign: "top", margin: 0 }
  );
  pageNo(s, 5);
}

// =====================================================================
// 后端① P6–P8
// =====================================================================
{
  const s = pres.addSlide();
  header(s, ROLES[1], "后端分层架构与统一规范", "Controller → Service → Repository → Entity，统一返回与全局异常处理");

  const layers = [
    ["Controller", "Product / Intent / Seller", "RESTful 路由与参数校验", CLAY],
    ["Service", "业务规则与状态流转", "事务边界，抛 BizException", CLAY_D],
    ["Repository", "Spring Data JPA", "持久化与队列查询", "6B8E7B"],
    ["Entity", "2 张主表 + 3 套枚举", "H2 默认，可切 MySQL", "4F6D7A"],
  ];
  layers.forEach((l, i) => {
    const y = 1.35 + i * 0.72;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 5.4, h: 0.6, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 0.07, h: 0.6, fill: { color: l[3] } });
    s.addText(l[0], { x: 0.72, y, w: 1.35, h: 0.6, fontFace: FB, fontSize: 12.5, bold: true, color: INK, valign: "middle", margin: 0 });
    s.addText(l[1], { x: 2.1, y, w: 2.1, h: 0.6, fontFace: FB, fontSize: 10, color: "4A423C", valign: "middle", margin: 0 });
    s.addText(l[2], { x: 4.25, y, w: 1.55, h: 0.6, fontFace: FB, fontSize: 9, color: MUTED, valign: "middle", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 6.15, y: 1.35, w: 3.35, h: 2.93, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.15, y: 1.35, w: 3.35, h: 0.42, fill: { color: CLAY_D } });
  s.addText("统一规范（common 包）", {
    x: 6.3, y: 1.35, w: 3.1, h: 0.42, fontFace: FB, fontSize: 11.5, bold: true, color: WHITE, valign: "middle", margin: 0,
  });
  s.addText(
    [
      { text: "Result", options: { bold: true, breakLine: true } },
      { text: "统一响应体 code + msg + data", options: { breakLine: true, paraSpaceAfter: 5 } },
      { text: "BizException", options: { bold: true, breakLine: true } },
      { text: "业务异常统一抛，转成规范错误码", options: { breakLine: true, paraSpaceAfter: 5 } },
      { text: "GlobalExceptionHandler", options: { bold: true, breakLine: true } },
      { text: "兜底捕获，不暴露堆栈", options: { breakLine: true, paraSpaceAfter: 6 } },
      { text: "CORS + /uploads", options: { bold: true, breakLine: true } },
      { text: "跨域放开，图片目录映射为静态资源", options: {} },
    ],
    { x: 6.35, y: 1.88, w: 2.95, h: 2.3, fontFace: FB, fontSize: 9.5, color: "4A423C", valign: "top", margin: 0 }
  );

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.4, w: 9, h: 0.52, fill: { color: SAND } });
  s.addText(
    [
      { text: "配置要点：", options: { bold: true } },
      { text: "默认 H2 内存库，clone 即可跑，无需安装 MySQL。切换方式是放开 pom.xml 中 mysql-connector 注释并改 datasource。启动时自动建表并灌入示例商品" },
    ],
    { x: 0.72, y: 4.4, w: 8.6, h: 0.52, fontFace: FB, fontSize: 10, color: INK, valign: "middle", margin: 0 }
  );
  pageNo(s, 6);
}

{
  const s = pres.addSlide();
  header(s, ROLES[1], "卖家认证：X-Token 拦截器", "卖家走账号密码登录后台，全程不接触买家口令码");

  const flow = [
    ["1", "卖家登录", "POST /api/seller/login\nBCrypt 校验密码\n签发 token 存入 TokenStore"],
    ["2", "请求携带", "axios 请求拦截器\n自动写入 X-Token 请求头"],
    ["3", "拦截器校验", "AuthInterceptor.preHandle\n取不到 sellerId 返回 401"],
  ];
  flow.forEach((f, i) => {
    const x = 0.5 + i * 3.05;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.35, w: 2.85, h: 1.5, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.16, y: 1.5, w: 0.36, h: 0.36, fill: { color: CLAY_D } });
    s.addText(f[0], { x: x + 0.16, y: 1.5, w: 0.36, h: 0.36, fontFace: FB, fontSize: 11, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(f[1], { x: x + 0.6, y: 1.5, w: 2.1, h: 0.36, fontFace: FB, fontSize: 12, bold: true, color: INK, valign: "middle", margin: 0 });
    const ls = f[2].split("\n");
    s.addText(
      ls.map((t, k) => ({ text: t, options: { breakLine: k < ls.length - 1, paraSpaceAfter: 2 } })),
      { x: x + 0.18, y: 1.98, w: 2.5, h: 0.8, fontFace: "Consolas", fontSize: 9.5, color: "4A423C", valign: "top", margin: 0 }
    );
    if (i < 2) arrowRight(s, x + 2.9, 2.02, 0.2, CLAY);
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.05, w: 9.0, h: 0.55, fill: { color: "2B2622" } });
  s.addText("addPathPatterns(\"/api/seller/**\")　　excludePathPatterns(\"/api/seller/login\")", {
    x: 0.7, y: 3.05, w: 8.6, h: 0.55, fontFace: "Consolas", fontSize: 10, color: SAGE, valign: "middle", margin: 0,
  });

  const rows = [
    [
      { text: "接口", options: { bold: true, fill: { color: CLAY_D }, color: WHITE } },
      { text: "说明", options: { bold: true, fill: { color: CLAY_D }, color: WHITE } },
    ],
    ["POST /api/seller/login", "登录，返回 token（默认 admin / admin123）"],
    ["PUT  /api/seller/password", "修改密码，校验原密码与强度"],
    ["POST /api/seller/upload", "商品图片上传，返回可访问地址"],
    ["GET  /api/seller/products", "全部商品（含历史商品）"],
    ["GET  /api/seller/intents", "意向购买人列表（不含口令码）"],
  ];
  s.addTable(rows, {
    x: 0.5, y: 3.65, w: 8.6, colW: [3.0, 5.6], rowH: 0.22,
    fontFace: "Consolas", fontSize: 9.5, color: INK, valign: "middle",
    border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false,
  });
  pageNo(s, 7);
}

{
  const s = pres.addSlide();
  header(s, ROLES[1], "核心接口清单", "买家端围绕口令码，卖家端围绕队列推进，两侧互不暴露");

  const rows = [
    [
      { text: "方法", options: { bold: true, fill: { color: CLAY }, color: WHITE } },
      { text: "路径", options: { bold: true, fill: { color: CLAY }, color: WHITE } },
      { text: "说明", options: { bold: true, fill: { color: CLAY }, color: WHITE } },
    ],
    ["GET", "/api/products/on-sale", "当前唯一可购买商品"],
    ["POST", "/api/intents", "提交购买意向，返回口令码"],
    ["GET", "/api/intents/track?code", "凭码查排队位次与状态"],
    ["PUT", "/api/intents/track", "凭码改姓名与电话"],
    ["POST", "/api/intents/cancel", "凭码撤销意向"],
    ["POST", "/api/seller/intents/{id}/start", "开始交易（仅队首，商品自动冻结）"],
    ["POST", "/api/seller/intents/{id}/succeed", "标记交易成功，商品下架"],
    ["POST", "/api/seller/intents/{id}/fail", "标记交易失败，商品恢复在售"],
    ["POST", "/api/seller/intents/{id}/requeue", "让失败意向重新排队"],
    ["POST", "/api/seller/intents/{id}/void", "将失败意向作废"],
    ["POST", "/api/seller/products/{id}/freeze", "卖家手动冻结商品"],
  ];
  s.addTable(rows, {
    x: 0.5, y: 1.35, w: 9, colW: [0.75, 3.9, 4.35], rowH: 0.27,
    fontFace: "Consolas", fontSize: 10, color: INK, valign: "middle",
    border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false,
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.78, w: 9, h: 0.42, fill: { color: SAND } });
  s.addText("另有解冻 unfreeze、手动下架 off-shelf、编辑与发布接口，全部遵循 RESTful 风格并统一前缀 /api", {
    x: 0.72, y: 4.78, w: 8.6, h: 0.42, fontFace: FB, fontSize: 9.5, color: INK, valign: "middle", margin: 0,
  });
  pageNo(s, 8);
}

// =====================================================================
// 后端② P9–P11
// =====================================================================
{
  const s = pres.addSlide();
  header(s, ROLES[2], "数据模型与三套枚举", "两张主表承载全部业务，枚举以字符串落库便于排查");

  const tables = [
    ["product 商品", "id · name · description · imageUrl · category\nprice · stock · sales · status · createdAt · soldAt", CLAY],
    ["purchase_intent 购买意向", "id · productId · code 口令码 · buyerName · buyerPhone\nstatus · result · queueTime 排队时间", CLAY_D],
    ["seller 卖家", "id · username · passwordHash\n（系统唯一卖家，兼管理员）", "6B8E7B"],
  ];
  tables.forEach((t, i) => {
    const y = 1.35 + i * 1.05;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 5.6, h: 0.95, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 0.07, h: 0.95, fill: { color: t[2] } });
    s.addText(t[0], { x: 0.72, y: y + 0.06, w: 3.2, h: 0.3, fontFace: FB, fontSize: 11.5, bold: true, color: INK, valign: "middle", margin: 0 });
    const ls = t[1].split("\n");
    s.addText(
      ls.map((x, k) => ({ text: x, options: { breakLine: k < ls.length - 1 } })),
      { x: 0.72, y: y + 0.36, w: 5.2, h: 0.55, fontFace: "Consolas", fontSize: 8.5, color: "4A423C", valign: "top", margin: 0 }
    );
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 6.35, y: 1.35, w: 3.15, h: 2.7, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.35, y: 1.35, w: 3.15, h: 0.42, fill: { color: "6B8E7B" } });
  s.addText("三套枚举", { x: 6.5, y: 1.35, w: 2.9, h: 0.42, fontFace: FB, fontSize: 11.5, bold: true, color: WHITE, valign: "middle", margin: 0 });
  s.addText(
    [
      { text: "ProductStatus（商品四态）", options: { bold: true, breakLine: true } },
      { text: "ON_SALE 在售 · FROZEN 已冻结", options: { breakLine: true } },
      { text: "OFF_SHELF 已下架 · RESTORED 已恢复在售", options: { breakLine: true, paraSpaceAfter: 6 } },
      { text: "IntentStatus（意向六态）", options: { bold: true, breakLine: true } },
      { text: "WAITING 等候中 · TRADING 交易中", options: { breakLine: true } },
      { text: "SUCCEEDED 成功 · FAILED 失败", options: { breakLine: true } },
      { text: "VOID 已作废 · CANCELED 已撤销", options: { breakLine: true, paraSpaceAfter: 6 } },
      { text: "买家不注册，因此没有买家表", options: {} },
    ],
    { x: 6.52, y: 1.88, w: 2.85, h: 2.1, fontFace: FB, fontSize: 9.5, color: "4A423C", valign: "top", margin: 0 }
  );

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.65, w: 9, h: 0.42, fill: { color: SAND } });
  s.addText("买家免注册，系统只按每次提交记录姓名与电话，不做身份识别，也不对同一人去重", {
    x: 0.72, y: 4.65, w: 8.6, h: 0.42, fontFace: FB, fontSize: 9.5, color: INK, valign: "middle", margin: 0,
  });
  pageNo(s, 9);
}

{
  const s = pres.addSlide();
  header(s, ROLES[2], "核心：商品四态状态机", "交易成功直接下架，交易失败才恢复在售，冻结是中间态");

  node(s, 0.5, 1.45, 1.7, 0.65, "在售", CLAY, WHITE);
  node(s, 2.9, 1.45, 1.7, 0.65, "已冻结", CLAY_D, WHITE);
  node(s, 5.4, 1.45, 1.7, 0.65, "已下架", "8A8178", WHITE);
  node(s, 2.9, 3.2, 1.7, 0.65, "已恢复在售", "6B8E7B", WHITE);

  arrowRight(s, 2.25, 1.55, 0.55, CLAY_D);
  edgeLabel(s, 2.15, 1.3, 0.8, "进入交易");
  arrowLeft(s, 2.25, 1.95, 0.55, CLAY);
  edgeLabel(s, 2.15, 2.2, 0.8, "手动解冻");
  arrowUp(s, 1.25, 2.15, 0.95, CLAY);
  edgeLabel(s, 1.3, 2.5, 0.7, "发布");
  arrowRight(s, 4.65, 1.62, 0.7, "8A8178");
  edgeLabel(s, 4.6, 1.8, 0.8, "交易成功");
  arrowDown(s, 3.6, 2.2, 0.95, "6B8E7B");
  edgeLabel(s, 3.9, 2.45, 1.1, "交易失败");

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.2, w: 1.7, h: 0.65, fill: { color: SAND }, line: { color: "C9C2B4", width: 0.75 } });
  s.addText("发布后直接是「在售」", {
    x: 0.5, y: 3.2, w: 1.7, h: 0.65, fontFace: FB, fontSize: 9.5, color: "5A524B",
    align: "center", valign: "middle", margin: 0,
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 7.6, y: 1.45, w: 1.9, h: 2.55, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.6, y: 1.45, w: 1.9, h: 0.4, fill: { color: "6B8E7B" } });
  s.addText("不变量", { x: 7.72, y: 1.45, w: 1.7, h: 0.4, fontFace: FB, fontSize: 11.5, bold: true, color: WHITE, valign: "middle", margin: 0 });
  s.addText(
    [
      { text: "可购买商品最多一件", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 4 } },
      { text: "冻结期不接受意向", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 4 } },
      { text: "已下架为终态只读", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 4 } },
      { text: "库存恒为 0 或 1", options: { bullet: { code: "2022" } } },
    ],
    { x: 7.75, y: 1.95, w: 1.65, h: 1.95, fontFace: FB, fontSize: 9.5, color: "4A423C", valign: "top", margin: 0 }
  );

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.35, w: 9, h: 0.72, fill: { color: SAND } });
  s.addText(
    [
      { text: "为什么关键：", options: { bold: true } },
      { text: "「单品单卖」要求可购买状态的商品严格唯一，所有状态转换都由 Service 层在事务内校验，非法流转直接抛业务异常。卖家也可在商品处于在售状态时手动下架，下架后即进入历史商品" },
    ],
    { x: 0.72, y: 4.35, w: 8.6, h: 0.72, fontFace: FB, fontSize: 10, color: INK, valign: "middle", margin: 0 }
  );
  pageNo(s, 10);
}

{
  const s = pres.addSlide();
  header(s, ROLES[2], "先到先得队列与口令码", "买家凭码管自己的意向，卖家按队列推进交易，两侧视角分离");

  const steps = [
    ["提交意向", "生成口令码，进入队尾", CLAY],
    ["队首交易", "商品自动冻结", CLAY_D],
    ["标记结果", "成功下架或失败恢复", CLAY_D],
    ["失败处置", "作废或重新排队", "6B8E7B"],
  ];
  steps.forEach((st, i) => {
    const x = 0.5 + i * 2.3;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.35, w: 2.0, h: 1.15, fill: { color: WHITE }, line: { color: st[2], width: 1.5 }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.35, w: 2.0, h: 0.32, fill: { color: st[2] } });
    s.addText(st[0], { x: x + 0.08, y: 1.35, w: 1.84, h: 0.32, fontFace: FB, fontSize: 10.5, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(st[1], { x: x + 0.12, y: 1.74, w: 1.78, h: 0.7, fontFace: FB, fontSize: 9, color: "4A423C", align: "center", valign: "top", margin: 0 });
    if (i < 3) arrowRight(s, x + 2.06, 1.83, 0.18, MUTED);
  });

  card(s, 0.5, 2.7, 4.35, 1.35, CLAY, "买家侧：一个口令码", [
    "凭码查排队位次（前面还有几人）",
    "凭码改姓名与电话，不改变位次",
    "凭码撤销，队列后面的自动前移",
  ], { bodySize: 9.5 });
  card(s, 5.15, 2.7, 4.35, 1.35, CLAY_D, "卖家侧：看不到口令码", [
    "只看姓名、电话、提交时间与交易结果",
    "只能与队首开始交易，不能跳位",
    "失败后确认作废或重新排队",
  ], { bodySize: 9.5 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.25, w: 9, h: 0.82, fill: { color: "2B2622" } });
  s.addText(
    [
      { text: "重新排队：", options: { bold: true, color: SAGE } },
      { text: "排队时间刷新后位次重置到队尾，买家侧仍是原来那个码，卖家侧按新时间另记一条。口令码在交易结束或商品下架后失效。", options: { color: "D8D2C6" } },
    ],
    { x: 0.72, y: 4.25, w: 8.6, h: 0.82, fontFace: FB, fontSize: 10, valign: "middle", margin: 0 }
  );
  pageNo(s, 11);
}

// =====================================================================
// 测试 P12–P14
// =====================================================================
{
  const s = pres.addSlide();
  header(s, ROLES[3], "测试策略与完成定义", "先覆盖状态流转与队列规则，再补接口与端到端");

  const levels = [
    ["单元测试", "状态机全路径\n队列位次计算", "JUnit", CLAY],
    ["接口测试", "核心接口\n参数校验与异常分支", "Postman", CLAY_D],
    ["端到端", "提交到成交主流程\n含失败与重排", "真机走查", "6B8E7B"],
    ["规则校验", "跳队、冻结期提交\n口令码失效", "脚本验证", "4F6D7A"],
  ];
  levels.forEach((l, i) => {
    const x = 0.5 + i * 2.26;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.35, w: 2.06, h: 1.3, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.35, w: 2.06, h: 0.34, fill: { color: l[3] } });
    s.addText(l[0], { x: x + 0.1, y: 1.35, w: 1.9, h: 0.34, fontFace: FB, fontSize: 11.5, bold: true, color: WHITE, valign: "middle", margin: 0 });
    const ls = l[1].split("\n");
    s.addText(
      ls.map((t, k) => ({ text: t, options: { breakLine: k < ls.length - 1, paraSpaceAfter: 2 } })),
      { x: x + 0.14, y: 1.76, w: 1.8, h: 0.55, fontFace: FB, fontSize: 9.5, color: "4A423C", valign: "top", margin: 0 }
    );
    s.addText(l[2], { x: x + 0.14, y: 2.34, w: 1.8, h: 0.25, fontFace: "Consolas", fontSize: 8.5, color: MUTED, valign: "middle", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 2.85, w: 4.35, h: 1.95, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 2.85, w: 0.07, h: 1.95, fill: { color: "4F6D7A" } });
  s.addText("完成定义 DoD", { x: 0.72, y: 2.95, w: 3.9, h: 0.3, fontFace: FB, fontSize: 12, bold: true, color: INK, valign: "middle", margin: 0 });
  s.addText(
    [
      { text: "代码通过 Code Review", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 4 } },
      { text: "核心状态流转有覆盖且通过", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 4 } },
      { text: "接口文档同步更新", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 4 } },
      { text: "无 P0 / P1 遗留缺陷", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 4 } },
      { text: "可在测试环境演示", options: { bullet: { code: "2022" } } },
    ],
    { x: 0.72, y: 3.3, w: 4.0, h: 1.4, fontFace: FB, fontSize: 9.5, color: "4A423C", valign: "top", margin: 0 }
  );

  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 2.85, w: 4.35, h: 1.95, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 2.85, w: 0.07, h: 1.95, fill: { color: CLAY } });
  s.addText("用例设计方法", { x: 5.37, y: 2.95, w: 3.9, h: 0.3, fontFace: FB, fontSize: 12, bold: true, color: INK, valign: "middle", margin: 0 });
  s.addText(
    [
      { text: "等价类：合法与非法状态组合", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 4 } },
      { text: "边界值：库存 0 与 1、队列首尾", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 4 } },
      { text: "状态迁移：每条转换正反各一例", options: { bullet: { code: "2022" }, breakLine: true, paraSpaceAfter: 4 } },
      { text: "场景法：按真实购买流程串联", options: { bullet: { code: "2022" } } },
    ],
    { x: 5.37, y: 3.3, w: 4.0, h: 1.4, fontFace: FB, fontSize: 9.5, color: "4A423C", valign: "top", margin: 0 }
  );
  pageNo(s, 12);
}

{
  const s = pres.addSlide();
  header(s, ROLES[3], "端到端验证结果", "主流程与关键规则约束均已实测通过");

  const rows = [
    [
      { text: "场景", options: { bold: true, fill: { color: "4F6D7A" }, color: WHITE } },
      { text: "操作", options: { bold: true, fill: { color: "4F6D7A" }, color: WHITE } },
      { text: "实测结果", options: { bold: true, fill: { color: "4F6D7A" }, color: WHITE } },
    ],
    ["提交三条意向", "连续提交三人", "各得唯一口令码，位次 1 / 2 / 3"],
    ["排队位次", "凭码查询", "第 N 位，前面人数正确"],
    ["跳队拦截", "对非队首开始交易", "拒绝，提示先到先得"],
    ["自动冻结", "队首开始交易", "TRADING，商品转 FROZEN"],
    ["冻结期提交", "冻结中提交新意向", "拒绝，提示商品交易中"],
    ["交易失败", "标记失败", "商品转 RESTORED 已恢复在售"],
    ["重新排队", "失败意向重排", "沿用原码，位次重置到队尾"],
    ["交易成功", "标记成功", "商品 OFF_SHELF，其余作废"],
    ["口令码失效", "下架后改或撤销", "拒绝，提示口令码已失效"],
  ];
  s.addTable(rows, {
    x: 0.5, y: 1.35, w: 9, colW: [2.2, 3.2, 3.6], rowH: 0.3,
    fontFace: FB, fontSize: 9.5, color: INK, valign: "middle",
    border: { pt: 0.5, color: "DDD6CC" }, fill: { color: WHITE }, autoPage: false,
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.55, w: 9, h: 0.6, fill: { color: SAND } });
  s.addText(
    [
      { text: "主流程：", options: { bold: true } },
      { text: "卖家发布商品，买家提交意向拿到口令码，卖家与队首开始交易后商品自动冻结，线下交易完成登记成功则商品下架，登记失败则商品恢复在售并由卖家决定作废或重新排队" },
    ],
    { x: 0.72, y: 4.55, w: 8.6, h: 0.6, fontFace: FB, fontSize: 10, color: INK, valign: "middle", margin: 0 }
  );
  pageNo(s, 13);
}

{
  const s = pres.addSlide();
  header(s, ROLES[3], "规则校验与缺陷管理", "把容易翻车的规则单独拎出来验证");

  card(s, 0.5, 1.35, 4.35, 1.2, "4F6D7A", "先到先得约束", ["只能与队首开始交易，卖家不能跳位", "非队首操作返回业务异常"], { bodySize: 9.5 });
  card(s, 5.15, 1.35, 4.35, 1.2, "4F6D7A", "冻结期保护", ["冻结期间不接受新的购买意向", "手动冻结与交易冻结共用同一状态"], { bodySize: 9.5 });
  card(s, 0.5, 2.7, 4.35, 1.2, "4F6D7A", "口令码生命周期", ["交易结束或商品下架后失效", "失效后不能再查询、修改或撤销"], { bodySize: 9.5 });
  card(s, 5.15, 2.7, 4.35, 1.2, "4F6D7A", "单品单卖约束", ["已有可购买商品时禁止发布新商品", "库存恒为 1，售出归 0"], { bodySize: 9.5 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.1, w: 9, h: 0.9, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
  s.addText("缺陷闭环：发现 → 登记复现步骤 → 定级 → 指派修复 → 回归验证 → 关闭", {
    x: 0.72, y: 4.18, w: 8.6, h: 0.3, fontFace: FB, fontSize: 11, bold: true, color: INK, valign: "middle", margin: 0,
  });
  const flow2 = ["发现", "登记", "定级", "修复", "回归", "关闭"];
  flow2.forEach((t, i) => {
    const x = 0.85 + i * 1.48;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 4.52, w: 1.15, h: 0.32, fill: { color: i === 5 ? "6B8E7B" : "4F6D7A" } });
    s.addText(t, { x, y: 4.52, w: 1.15, h: 0.32, fontFace: FB, fontSize: 10, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    if (i < 5) arrowRight(s, x + 1.18, 4.6, 0.26, MUTED);
  });
  pageNo(s, 14);
}

// =====================================================================
// 文档 P15–P18
// =====================================================================
{
  const s = pres.addSlide();
  header(s, ROLES[4], "文档体系与工作量估算", "需求、任务与实现三层可双向追溯");

  stat(s, 0.5, 1.35, 2.15, 1.0, "254", "产品订单故事点", "8A6F47");
  stat(s, 2.78, 1.35, 2.15, 1.0, "45", "用户故事", CLAY);
  stat(s, 5.06, 1.35, 2.15, 1.0, "12", "特性 Epic", CLAY_D);
  stat(s, 7.34, 1.35, 2.15, 1.0, "34", "冲刺任务", "6B8E7B");

  const docs = [
    ["README.md", "项目说明、快速开始、接口一览、协作规范", CLAY],
    ["产品订单 Product Backlog", "12 特性 + 45 用户故事，MoSCoW 优先级", CLAY_D],
    ["冲刺订单 Sprint Backlog", "34 个任务、估算工时、完成情况与签名认领", "6B8E7B"],
    ["三张设计图", "功能结构图、用例图、买家购买业务流程图", "4F6D7A"],
    ["需求澄清记录", "与助教确认的单品单卖与口令码规则", "8A6F47"],
  ];
  docs.forEach((d, i) => {
    const y = 2.42 + i * 0.34;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 9, h: 0.31, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 0.07, h: 0.31, fill: { color: d[2] } });
    s.addText(d[0], { x: 0.72, y, w: 2.9, h: 0.31, fontFace: FB, fontSize: 10, bold: true, color: INK, valign: "middle", margin: 0 });
    s.addText(d[1], { x: 3.65, y, w: 5.7, h: 0.31, fontFace: FB, fontSize: 9.5, color: "4A423C", valign: "middle", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.2, w: 9, h: 0.78, fill: { color: SAND } });
  s.addText(
    [
      { text: "可追溯性：", options: { bold: true } },
      { text: "产品订单的每条用户故事对应冲刺订单的具体任务，任务再对应到代码提交，评审时可按故事编号逐条验收" },
    ],
    { x: 0.72, y: 4.2, w: 8.6, h: 0.78, fontFace: FB, fontSize: 10.5, color: INK, valign: "middle", margin: 0 }
  );
  pageNo(s, 15);
}

{
  const s = pres.addSlide();
  header(s, ROLES[4], "需求分析产出（一）：功能结构图", "系统拆为买家端、卖家后台与系统任务三层，是任务拆解的依据");

  const fig1 = path.join(IMG_DIR, "图1_在线购物系统功能结构图.png");
  s.addImage({ path: fig1, x: 0.5, y: 1.5, w: 9.0, h: 9.0 * 476 / 2306 });
  s.addText("图 1  在线购物系统功能结构图", {
    x: 0.5, y: 3.4, w: 9, h: 0.26, fontFace: FB, fontSize: 10, bold: true, color: CLAY_D, align: "center", valign: "middle", margin: 0,
  });

  card(s, 0.5, 3.8, 4.35, 1.2, CLAY, "买家端", [
    "浏览在售商品、提交购买意向",
    "凭口令码查询位次与管理自己的意向",
  ], { bodySize: 9.5 });
  card(s, 5.15, 3.8, 4.35, 1.2, CLAY_D, "卖家后台", [
    "发布并管理唯一在售商品",
    "按先到先得推进交易并登记结果",
  ], { bodySize: 9.5 });
  pageNo(s, 16);
}

{
  const s = pres.addSlide();
  header(s, ROLES[4], "需求分析产出（二）：用例图与业务流程图", "左图回答谁用什么功能，右图描述从意向到成交的完整分支");

  const fig2 = path.join(IMG_DIR, "图2_在线购物系统用例图.png");
  s.addImage({ path: fig2, x: 0.5, y: 1.4, w: 4.8, h: 4.8 * 905 / 1280 });
  s.addText("图 2  用例图：买家（游客）与卖家（店主）", {
    x: 0.5, y: 4.82, w: 4.8, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: CLAY_D, align: "center", valign: "middle", margin: 0,
  });

  const fig3 = path.join(IMG_DIR, "图3_买家购买商品业务流程图.png");
  s.addImage({ path: fig3, x: 5.5, y: 1.4, w: 3.39 * 970 / 1165, h: 3.39 });
  s.addText("图 3  买家购买业务流程", {
    x: 5.5, y: 4.82, w: 2.82, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: CLAY_D, align: "center", valign: "middle", margin: 0,
  });
  pageNo(s, 17);
}

{
  const s = pres.addSlide();
  header(s, ROLES[4], "部署步骤与演示脚本", "两条命令启动，默认免装数据库，评审现场可一键演示");

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.35, w: 4.35, h: 1.5, fill: { color: "2B2622" } });
  s.addText("# 1 启动后端（端口 8080）", { x: 0.68, y: 1.42, w: 4, h: 0.24, fontFace: "Consolas", fontSize: 9.5, color: "8A8178", margin: 0 });
  s.addText("cd backend\nmvn spring-boot:run", { x: 0.68, y: 1.68, w: 4, h: 0.5, fontFace: "Consolas", fontSize: 11, color: SAGE, margin: 0 });
  s.addText("# 2 启动前端（端口 5173）", { x: 0.68, y: 2.2, w: 4, h: 0.24, fontFace: "Consolas", fontSize: 9.5, color: "8A8178", margin: 0 });
  s.addText("cd frontend\nnpm install && npm run dev", { x: 0.68, y: 2.44, w: 4, h: 0.35, fontFace: "Consolas", fontSize: 11, color: SAGE, margin: 0 });

  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 1.35, w: 4.35, h: 1.5, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 1.35, w: 4.35, h: 0.36, fill: { color: "8A6F47" } });
  s.addText("默认账号与环境", { x: 5.3, y: 1.35, w: 4, h: 0.36, fontFace: FB, fontSize: 11, bold: true, color: WHITE, valign: "middle", margin: 0 });
  s.addText(
    [
      { text: "卖家账号：admin / admin123", options: { breakLine: true, paraSpaceAfter: 4 } },
      { text: "数据库：H2 内存库，可切 MySQL 8", options: { breakLine: true, paraSpaceAfter: 4 } },
      { text: "环境：JDK 21 · Maven 3.9 · Node 18+", options: { breakLine: true, paraSpaceAfter: 4 } },
      { text: "浏览器打开 http://localhost:5173", options: {} },
    ],
    { x: 5.32, y: 1.78, w: 4.05, h: 1.0, fontFace: FB, fontSize: 9.5, color: "4A423C", valign: "top", margin: 0 }
  );

  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.05, w: 9, h: 0.36, fill: { color: CLAY } });
  s.addText("评审演示脚本（约 3 分钟）", { x: 0.68, y: 3.05, w: 8.6, h: 0.36, fontFace: FB, fontSize: 11.5, bold: true, color: WHITE, valign: "middle", margin: 0 });

  const script = [
    ["①", "首页看到商品并提交意向拿口令码"],
    ["②", "凭口令码查询排队位次与状态"],
    ["③", "与队首开始交易，商品自动冻结"],
    ["④", "线下交易后登记成功，商品下架"],
    ["⑤", "演示失败路径：商品恢复在售并重新排队"],
    ["⑥", "商品下架后再查口令码，提示已失效"],
  ];
  script.forEach((sc, i) => {
    const x = 0.5 + (i % 3) * 3.05;
    const y = 3.55 + Math.floor(i / 3) * 0.62;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.9, h: 0.52, fill: { color: WHITE }, line: { color: "E3DDD4", width: 0.75 } });
    s.addShape(pres.shapes.OVAL, { x: x + 0.12, y: y + 0.1, w: 0.32, h: 0.32, fill: { color: CLAY } });
    s.addText(sc[0], { x: x + 0.12, y: y + 0.1, w: 0.32, h: 0.32, fontFace: FB, fontSize: 9.5, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(sc[1], { x: x + 0.5, y: y + 0.06, w: 2.32, h: 0.4, fontFace: FB, fontSize: 9, color: "4A423C", valign: "middle", margin: 0 });
  });
  pageNo(s, 18);
}

// =====================================================================
// P19 结尾
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.14, fill: { color: CLAY } });
  s.addText("阶段总结与下一步", {
    x: 0.7, y: 0.45, w: 8.6, h: 0.55, fontFace: FT, fontSize: 26, bold: true, color: WHITE, valign: "middle", margin: 0,
  });

  const cols = [
    ["已跑通", ["单品单卖：可购买商品严格唯一", "买家免注册，凭口令码排队", "先到先得队列与位次查询", "交易成功下架、失败恢复在售", "卖家手动冻结、解冻与下架"], "6B8E7B"],
    ["进行中", ["历史商品只读浏览页", "意向人列表按商品维度查看", "数据统计看板", "接口文档与燃尽图更新"], CLAY],
    ["下一步", ["评价管理与营销位", "移动端自适应与小程序端", "接口限流与防刷单", "切换到 MySQL 持久化"], "8A6F47"],
  ];
  cols.forEach((c, i) => {
    const x = 0.7 + i * 2.95;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.25, w: 2.75, h: 2.2, fill: { color: "3A332E" } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.25, w: 2.75, h: 0.06, fill: { color: c[2] } });
    s.addText(c[0], { x: x + 0.18, y: 1.4, w: 2.4, h: 0.36, fontFace: FB, fontSize: 13, bold: true, color: c[2], valign: "middle", margin: 0 });
    s.addText(
      c[1].map((t, k) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: k < c[1].length - 1, paraSpaceAfter: 5 } })),
      { x: x + 0.18, y: 1.85, w: 2.4, h: 1.5, fontFace: FB, fontSize: 10, color: "D8D2C6", valign: "top", margin: 0 }
    );
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.05, w: 8.6, h: 0.75, fill: { color: "3A332E" } });
  s.addText(
    [
      { text: "一句话总结：", options: { bold: true, color: CLAY } },
      { text: "单品单卖的基线闭环已经全部落地并实测通过，接下来补齐历史追溯与移动端触达能力。", options: { color: "D8D2C6" } },
    ],
    { x: 0.9, y: 4.05, w: 8.2, h: 0.75, fontFace: FB, fontSize: 11.5, valign: "middle", margin: 0 }
  );
  s.addText("感谢聆听　·　欢迎提问", {
    x: 0.7, y: 4.95, w: 8.6, h: 0.3, fontFace: FB, fontSize: 11, color: "A79E94", valign: "middle", margin: 0,
  });
}

const out = path.join(__dirname, "在线购物系统_阶段汇报_五人分工.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("OK ->", out));
