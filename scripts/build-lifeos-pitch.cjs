const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
const slideLimit = Number(process.env.SLIDE_LIMIT || 99);
let slideNo = 0;
function includeSlide() {
  slideNo += 1;
  return slideNo <= slideLimit;
}
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'LifeOS Agent Team';
pptx.company = 'OPC Hackathon';
pptx.subject = 'LifeOS Agent pitch deck';
pptx.title = 'LifeOS Agent 路演PPT';
pptx.lang = 'zh-CN';
pptx.theme = {
  headFontFace: 'Microsoft YaHei UI',
  bodyFontFace: 'Microsoft YaHei UI',
  lang: 'zh-CN',
};
pptx.defineLayout({ name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'CUSTOM_WIDE';
pptx.margin = 0;

const W = 13.333;
const H = 7.5;
const C = {
  bg: '050816',
  bg2: '09122A',
  panel: '101A36',
  panel2: '141F42',
  cyan: '5EEAD4',
  blue: '60A5FA',
  violet: 'A78BFA',
  pink: 'F472B6',
  gold: 'F6C768',
  white: 'F8FAFC',
  muted: '9CA3AF',
  line: '263A68',
  dark: '020617',
};

function addBg(slide, variant = 'default') {
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.bg }, line: { color: C.bg } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: variant === 'purple' ? '0D0B28' : C.bg2, transparency: 12 }, line: { color: C.bg } });

  for (let i = 0; i < 15; i += 1) {
    const x = (i * 0.93) % W;
    slide.addShape(pptx.ShapeType.line, { x, y: 0, w: 0, h: H, line: { color: '1B2A52', transparency: 58, width: 0.4 } });
  }
  for (let i = 0; i < 9; i += 1) {
    const y = (i * 0.86) % H;
    slide.addShape(pptx.ShapeType.line, { x: 0, y, w: W, h: 0, line: { color: '1B2A52', transparency: 62, width: 0.4 } });
  }

  slide.addShape(pptx.ShapeType.arc, { x: 8.4, y: -0.9, w: 5.2, h: 5.2, adjustPoint: 0.22, line: { color: C.cyan, transparency: 74, width: 1.1 } });
  slide.addShape(pptx.ShapeType.arc, { x: 7.6, y: -1.4, w: 6.6, h: 6.6, adjustPoint: 0.18, line: { color: C.violet, transparency: 78, width: 1.1 } });
  slide.addShape(pptx.ShapeType.arc, { x: -1.4, y: 4.9, w: 4.2, h: 4.2, adjustPoint: 0.2, line: { color: C.blue, transparency: 82, width: 1 } });
}

function footer(slide, idx) {
  slide.addText(`LifeOS Agent · OPC Hackathon · ${String(idx).padStart(2, '0')}`, {
    x: 0.55, y: 7.14, w: 6.5, h: 0.2, fontSize: 8.5, color: '7181A6', margin: 0,
  });
}

function title(slide, eyebrow, main, sub) {
  slide.addText(eyebrow, {
    x: 0.62, y: 0.42, w: 4.8, h: 0.25, fontSize: 9.5, color: C.cyan,
    bold: true, charSpacing: 2.6, margin: 0,
  });
  slide.addText(main, {
    x: 0.6, y: 0.72, w: 7.5, h: 0.58, fontFace: 'Microsoft YaHei UI',
    fontSize: 29, color: C.white, bold: true, margin: 0, breakLine: false,
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.62, y: 1.42, w: 7.4, h: 0.34, fontSize: 12.4, color: C.muted, margin: 0,
      fit: 'shrink',
    });
  }
}

function pill(slide, text, x, y, w, color = C.cyan) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.34, rectRadius: 0.06,
    fill: { color, transparency: 84 },
    line: { color, transparency: 35, width: 1 },
  });
  slide.addText(text, { x: x + 0.12, y: y + 0.08, w: w - 0.24, h: 0.12, fontSize: 8.5, bold: true, color, charSpacing: 1.1, margin: 0, align: 'center' });
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.fill || C.panel, transparency: opts.transparency ?? 10 },
    line: { color: opts.line || C.line, transparency: opts.lineTransparency ?? 8, width: opts.lineWidth ?? 1.05 },
    shadow: { type: 'outer', color: '000000', blur: 2, offset: 1, angle: 45, opacity: 0.16 },
  });
}

function miniHeader(slide, text, x, y, icon = '✦', color = C.cyan) {
  slide.addShape(pptx.ShapeType.ellipse, { x, y, w: 0.32, h: 0.32, fill: { color, transparency: 82 }, line: { color, transparency: 24 } });
  slide.addText(icon, { x: x + 0.075, y: y + 0.06, w: 0.17, h: 0.16, fontSize: 8, color, bold: true, margin: 0 });
  slide.addText(text, { x: x + 0.43, y: y + 0.06, w: 3.3, h: 0.16, fontSize: 10.5, color: C.white, bold: true, margin: 0 });
}

function bulletList(slide, items, x, y, w, color = C.white, size = 11) {
  const runs = [];
  items.forEach((item, index) => {
    runs.push({ text: item, options: { bullet: { indent: 12 }, breakLine: index !== items.length - 1 } });
  });
  slide.addText(runs, { x, y, w, h: Math.max(0.32 * items.length, 0.45), fontSize: size, color, margin: 0.02, breakLine: false, fit: 'shrink', paraSpaceAfterPt: 4 });
}

function connect(slide, x1, y1, x2, y2, color = C.cyan) {
  slide.addShape(pptx.ShapeType.line, {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1),
    h: Math.abs(y2 - y1),
    line: { color, transparency: 20, width: 1.3 },
  });
}

function node(slide, text, x, y, w, color = C.cyan) {
  card(slide, x, y, w, 0.62, { fill: '0B1530', line: color, lineTransparency: 35 });
  slide.addText(text, { x: x + 0.12, y: y + 0.18, w: w - 0.24, h: 0.16, fontSize: 10, color: C.white, bold: true, align: 'center', margin: 0 });
}

// Slide 1
if (includeSlide()) {
  const slide = pptx.addSlide();
  addBg(slide, 'purple');
  slide.addText('LifeOS Agent', { x: 0.75, y: 0.72, w: 7.3, h: 0.72, fontSize: 42, bold: true, color: C.white, margin: 0 });
  slide.addText('伴随式自进化个人成长智能体', { x: 0.78, y: 1.6, w: 6.8, h: 0.36, fontSize: 18, color: C.cyan, bold: true, margin: 0 });
  slide.addText('用 Agent Harness / Memory / Skills / Dreaming，把日常记录变成可追踪、可反馈、可进化的成长系统。', {
    x: 0.8, y: 2.25, w: 6.1, h: 0.78, fontSize: 15, color: 'CBD5E1', margin: 0, fit: 'shrink',
  });
  ['Memory', 'Skills', 'Dreaming', 'Harness', 'File-system'].forEach((t, i) => pill(slide, t, 0.8 + i * 1.25, 3.25, 1.05, i % 2 ? C.violet : C.cyan));

  slide.addShape(pptx.ShapeType.ellipse, { x: 8.0, y: 1.18, w: 3.7, h: 3.7, fill: { color: C.cyan, transparency: 88 }, line: { color: C.cyan, transparency: 20, width: 2 } });
  slide.addShape(pptx.ShapeType.ellipse, { x: 8.42, y: 1.6, w: 2.86, h: 2.86, fill: { color: '111B3B', transparency: 8 }, line: { color: C.violet, transparency: 20, width: 1.5 } });
  slide.addText('OS', { x: 9.05, y: 2.32, w: 1.6, h: 0.65, fontSize: 44, bold: true, color: C.white, align: 'center', margin: 0 });
  slide.addText('LIFE CORE', { x: 9.13, y: 3.05, w: 1.45, h: 0.16, fontSize: 8.5, color: C.cyan, align: 'center', charSpacing: 1.8, margin: 0 });
  slide.addText('修仙是框架，Agent 工程是核心', { x: 8.15, y: 5.55, w: 3.45, h: 0.28, fontSize: 15, bold: true, color: C.gold, align: 'center', margin: 0 });
  footer(slide, 1);
}

// Slide 2
if (includeSlide()) {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, 'USER PAIN', '长期独自学习，不缺工具，缺一个会进化的陪伴者', '目标用户：长期自学、做项目、准备比赛、探索方向的学生 / 个人开发者');
  const pains = [
    ['记录碎片化', '今天写了什么、卡在哪里，很快变成散落信息。'],
    ['计划反复失败', '失败原因没有被系统性总结，下一次仍然踩坑。'],
    ['AI 只回答单次问题', '缺少长期上下文、持续反馈与策略调整。'],
    ['成长不可见', '努力没有沉淀成轨迹、阶段、突破和模式。'],
  ];
  pains.forEach((p, i) => {
    const x = 0.75 + (i % 2) * 6.1;
    const y = 2.12 + Math.floor(i / 2) * 1.78;
    card(slide, x, y, 5.45, 1.24, { line: i % 2 ? C.violet : C.cyan });
    miniHeader(slide, p[0], x + 0.26, y + 0.25, String(i + 1), i % 2 ? C.violet : C.cyan);
    slide.addText(p[1], { x: x + 0.7, y: y + 0.7, w: 4.3, h: 0.28, fontSize: 11.5, color: 'CBD5E1', margin: 0 });
  });
  slide.addText('核心问题', { x: 0.8, y: 6.05, w: 1.2, h: 0.24, fontSize: 12, color: C.cyan, bold: true, margin: 0 });
  slide.addText('一个人长期往前走时，需要的不是更多提醒，而是“记录他、理解他、复盘他，并和他一起进化”的智能体。', {
    x: 2.0, y: 6.0, w: 9.9, h: 0.34, fontSize: 15, color: C.white, bold: true, margin: 0, fit: 'shrink',
  });
  footer(slide, 2);
}

// Slide 3
if (includeSlide()) {
  const slide = pptx.addSlide();
  addBg(slide, 'purple');
  title(slide, 'PRODUCT POSITIONING', 'LifeOS：伴随式成长操作系统', '把修仙世界观映射为真实产品机制，而不是表层 gamification');
  const mappings = [
    ['洞府', '个人成长工作台'],
    ['修炼日志', '日常输入 / 复盘'],
    ['境界 / 子境界', '长期成长进度'],
    ['功法', 'Agent Skills'],
    ['心魔', '阻碍模式'],
    ['命运长河', '成长时间线'],
  ];
  mappings.forEach((m, i) => {
    const x = 0.82 + (i % 3) * 4.05;
    const y = 2.0 + Math.floor(i / 3) * 1.45;
    card(slide, x, y, 3.55, 0.95, { fill: i % 2 ? '111332' : '0B1734', line: i % 2 ? C.violet : C.cyan });
    slide.addText(m[0], { x: x + 0.2, y: y + 0.18, w: 1.1, h: 0.2, fontSize: 13, bold: true, color: C.gold, margin: 0 });
    slide.addText(m[1], { x: x + 1.25, y: y + 0.18, w: 2.0, h: 0.35, fontSize: 11, color: C.white, margin: 0, fit: 'shrink' });
  });
  card(slide, 1.25, 5.14, 10.8, 0.86, { fill: '071426', line: C.cyan });
  slide.addText('设计原则', { x: 1.55, y: 5.38, w: 1.1, h: 0.18, fontSize: 12, color: C.cyan, bold: true, margin: 0 });
  slide.addText('境界进度 ≠ 任务数量；而是稳定执行 + 复盘质量 + 项目推进 + 心魔改善 + Skill 熟练度。', {
    x: 2.72, y: 5.35, w: 8.9, h: 0.24, fontSize: 13.5, color: C.white, bold: true, margin: 0, fit: 'shrink',
  });
  footer(slide, 3);
}

// Slide 4
if (includeSlide()) {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, 'CORE EXPERIENCE', '从一段日记，到一次完整 Agent 成长闭环', 'MVP 要稳定演示这一条链路：输入 -> 解析 -> 记忆 -> 技能 -> 反馈 -> 可视化');
  const flow = [
    ['Daily Input', 0.8, 2.55],
    ['Memory Retrieval', 2.72, 2.55],
    ['Skill Selection', 4.94, 2.55],
    ['Reflection / Plan', 7.0, 2.55],
    ['Harness Eval', 9.2, 2.55],
    ['Evolution', 11.1, 2.55],
  ];
  flow.forEach(([t, x, y], i) => {
    node(slide, t, x, y, i === 3 ? 1.72 : 1.55, i % 2 ? C.violet : C.cyan);
    if (i < flow.length - 1) connect(slide, x + (i === 3 ? 1.72 : 1.55), y + 0.31, flow[i + 1][1], y + 0.31, i % 2 ? C.violet : C.cyan);
  });
  const cards = [
    ['修炼日志', '自然语言输入今日学习、项目、情绪、卡点'],
    ['明日计划', '结合长期目标、当前状态和失败模式生成计划'],
    ['洞府 / 长河', '境界、心魔、时间线、灵根雷达同步变化'],
  ];
  cards.forEach((c, i) => {
    card(slide, 1.0 + i * 4.08, 4.35, 3.45, 1.0, { line: [C.cyan, C.violet, C.gold][i] });
    slide.addText(c[0], { x: 1.25 + i * 4.08, y: 4.58, w: 1.5, h: 0.2, fontSize: 13, bold: true, color: [C.cyan, C.violet, C.gold][i], margin: 0 });
    slide.addText(c[1], { x: 1.25 + i * 4.08, y: 4.94, w: 2.85, h: 0.28, fontSize: 10.5, color: 'CBD5E1', margin: 0, fit: 'shrink' });
  });
  footer(slide, 4);
}

// Slide 5
if (includeSlide()) {
  const slide = pptx.addSlide();
  addBg(slide, 'purple');
  title(slide, 'AGENT ENGINEERING', '可追踪的 Agent 工程闭环', '核心不是界面，而是把每一次建议拆成可观测、可反馈、可进化的节点');
  card(slide, 4.72, 2.5, 3.9, 1.25, { fill: '091737', line: C.cyan, lineWidth: 1.4 });
  slide.addText('Agent Harness', { x: 5.05, y: 2.87, w: 3.2, h: 0.24, fontSize: 20, color: C.white, bold: true, align: 'center', margin: 0 });
  slide.addText('traceSteps / stateDiff / latency', { x: 5.18, y: 3.27, w: 2.9, h: 0.15, fontSize: 9.5, color: C.cyan, align: 'center', charSpacing: 1.2, margin: 0 });
  const around = [
    ['Input Parser', 1.0, 1.82],
    ['Memory Store', 1.05, 4.75],
    ['Skill Registry', 5.0, 5.45],
    ['Evaluator', 9.8, 4.75],
    ['Dreaming', 10.0, 1.82],
  ];
  around.forEach(([t, x, y], i) => {
    node(slide, t, x, y, 2.25, [C.blue, C.cyan, C.violet, C.gold, C.pink][i]);
    connect(slide, x + 1.12, y + 0.62, 6.67, 3.13, [C.blue, C.cyan, C.violet, C.gold, C.pink][i]);
  });
  slide.addText('工程可见性', { x: 0.9, y: 6.25, w: 1.6, h: 0.2, fontSize: 12, color: C.cyan, bold: true, margin: 0 });
  slide.addText('每次 run 不只返回答案，还记录输入摘要、Memory 检索、Skill 选择、模型调用、评估、状态变化与持久化。', {
    x: 2.42, y: 6.22, w: 9.6, h: 0.24, fontSize: 13, color: C.white, margin: 0, fit: 'shrink',
  });
  footer(slide, 5);
}

// Slide 6
if (includeSlide()) {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, 'MEMORY + SKILLS', '双循环：越懂你，也越会帮你', 'Memory 负责长期画像，Skills 负责可复用方法，两者都能被反馈更新');
  card(slide, 0.85, 2.0, 5.45, 3.55, { line: C.cyan });
  miniHeader(slide, 'Memory Store / 文件式系统内存', 1.12, 2.25, 'M', C.cyan);
  slide.addText('/memory-vault\n  /profile.md\n  /memories/*.md\n  /skills/*.md\n  /traces/*.md\n  /dreams/*.md', {
    x: 1.25, y: 2.85, w: 4.55, h: 1.25, fontFace: 'Consolas', fontSize: 14, color: C.cyan, margin: 0,
  });
  bulletList(slide, ['从重复模式提炼长期结论', '可审查、可编辑、可被 Agent 重新读取', '记忆必须解释“为什么这样建议”'], 1.18, 4.48, 4.8, 'CBD5E1', 10.8);

  card(slide, 7.05, 2.0, 5.45, 3.55, { line: C.violet });
  miniHeader(slide, 'Skills / 功法注册表', 7.32, 2.25, 'S', C.violet);
  const skills = [
    ['daily_reflection', '每日复盘'],
    ['planning', '周天规划'],
    ['obstacle_detection', '心魔识别'],
    ['memory_consolidation', '记忆凝练'],
    ['project_breakdown', '项目拆解'],
  ];
  skills.forEach((s, i) => {
    slide.addText(s[0], { x: 7.55, y: 2.86 + i * 0.38, w: 2.1, h: 0.16, fontFace: 'Consolas', fontSize: 9.8, color: C.violet, margin: 0 });
    slide.addText(s[1], { x: 9.78, y: 2.86 + i * 0.38, w: 1.75, h: 0.16, fontSize: 10.2, color: C.white, margin: 0 });
  });
  slide.addText('Skill Evolution 示例：planning.intensity 下调、taskGranularity -> micro', {
    x: 7.55, y: 5.05, w: 4.2, h: 0.22, fontSize: 10.5, color: C.gold, bold: true, margin: 0,
  });
  footer(slide, 6);
}

// Slide 7
if (includeSlide()) {
  const slide = pptx.addSlide();
  addBg(slide, 'purple');
  title(slide, 'SELF-EVOLUTION', '自进化不是玄学，是明确的反馈回路', 'Feedback + Dreaming + Harness Trace，让 Agent 的变化可以被解释');
  const lanes = [
    ['Feedback Evolution', '用户评价计划太重 / 刚刚好 / 有帮助', '调整 Skill 参数与后续策略', C.cyan],
    ['Dreaming Mechanism', '离线读取近期 traces / logs / feedbacks', '沉淀长期模式与下一轮实验', C.violet],
    ['Trace Evidence', '每一步有 inputSummary / outputSummary / latency', '评委可直接回放工程证据链', C.gold],
  ];
  lanes.forEach((l, i) => {
    const y = 1.95 + i * 1.28;
    card(slide, 0.95, y, 11.45, 0.92, { fill: i % 2 ? '101638' : '0B1732', line: l[3] });
    slide.addText(l[0], { x: 1.25, y: y + 0.18, w: 2.5, h: 0.2, fontSize: 14, bold: true, color: l[3], margin: 0 });
    slide.addText(l[1], { x: 3.95, y: y + 0.18, w: 3.55, h: 0.2, fontSize: 11.2, color: 'CBD5E1', margin: 0, fit: 'shrink' });
    slide.addText('→', { x: 7.68, y: y + 0.13, w: 0.32, h: 0.22, fontSize: 16, color: l[3], bold: true, margin: 0 });
    slide.addText(l[2], { x: 8.15, y: y + 0.18, w: 3.7, h: 0.2, fontSize: 11.2, color: C.white, bold: true, margin: 0, fit: 'shrink' });
  });
  card(slide, 2.0, 6.0, 9.35, 0.56, { fill: '071426', line: C.cyan });
  slide.addText('最终形成：Daily Input -> Memory Retrieval -> Skill Selection -> Reflection -> Evaluation -> Memory Update -> Skill Evolution', {
    x: 2.3, y: 6.17, w: 8.75, h: 0.18, fontFace: 'Consolas', fontSize: 9.5, color: C.cyan, align: 'center', margin: 0,
  });
  footer(slide, 7);
}

// Slide 8
if (includeSlide()) {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, 'VISUAL PRODUCT', '让成长被看见：洞府、长河、灵根与内核舱', '视觉不是装饰，而是把抽象成长过程变成可感知体验');
  const modules = [
    ['洞府总览', '动态 Life Core、境界进度、当前心魔、修炼摘要'],
    ['修炼日志', '居中输入、图片上传、提交后显示 Agent 解析'],
    ['成长轨迹', '命运长河瀑布流、趋势图谱、灵根目录'],
    ['内核舱', '产品化展示 Memory / Skills / Feedback / Dreaming'],
  ];
  modules.forEach((m, i) => {
    const x = 0.85 + (i % 2) * 6.0;
    const y = 2.0 + Math.floor(i / 2) * 1.56;
    card(slide, x, y, 5.35, 1.08, { fill: '0B1530', line: i % 2 ? C.violet : C.cyan });
    slide.addText(m[0], { x: x + 0.25, y: y + 0.25, w: 1.6, h: 0.22, fontSize: 15, bold: true, color: i % 2 ? C.violet : C.cyan, margin: 0 });
    slide.addText(m[1], { x: x + 1.9, y: y + 0.25, w: 3.05, h: 0.35, fontSize: 10.6, color: C.white, margin: 0, fit: 'shrink' });
  });
  slide.addText('Demo 主线', { x: 0.9, y: 5.7, w: 1.3, h: 0.22, fontSize: 13, color: C.gold, bold: true, margin: 0 });
  slide.addText('打开洞府 → 提交今日日志 → 查看 Agent 解析 → 一键闭环 → 进入内核舱看 Memory / Skills / Dreaming / Harness 证据', {
    x: 2.1, y: 5.68, w: 10.0, h: 0.24, fontSize: 13, color: C.white, bold: true, margin: 0, fit: 'shrink',
  });
  footer(slide, 8);
}

// Slide 9
if (includeSlide()) {
  const slide = pptx.addSlide();
  addBg(slide, 'purple');
  title(slide, 'WHY IT MATTERS', 'LifeOS Agent：让一个人的长期成长拥有反馈系统', '不是普通日程，不是一次性聊天，而是可记忆、可回放、可进化的个人 Agent');
  const claims = [
    ['产品价值', '解决独自学习/做项目时的长期陪伴、复盘与方向感问题。'],
    ['技术亮点', 'Agent Harness + Memory + Skills + Dreaming + 文件系统内存。'],
    ['路演亮点', '修仙框架让成长可视化，工程证据证明 Agent 真实闭环。'],
  ];
  claims.forEach((c, i) => {
    card(slide, 0.9 + i * 4.15, 2.2, 3.55, 1.55, { line: [C.cyan, C.violet, C.gold][i] });
    slide.addText(c[0], { x: 1.2 + i * 4.15, y: 2.55, w: 2.0, h: 0.24, fontSize: 16, bold: true, color: [C.cyan, C.violet, C.gold][i], margin: 0 });
    slide.addText(c[1], { x: 1.2 + i * 4.15, y: 3.04, w: 2.95, h: 0.4, fontSize: 11, color: 'CBD5E1', margin: 0, fit: 'shrink' });
  });
  slide.addText('“在 LifeOS 里，功法就是 Skills，心魔就是阻碍模式，境界就是长期成长轨迹。修仙不是皮肤，而是一套可解释、可视化、可进化的个人成长模型。”', {
    x: 1.25, y: 4.9, w: 10.8, h: 0.72, fontSize: 18, color: C.white, bold: true, align: 'center', margin: 0, fit: 'shrink',
  });
  slide.addText('Thank you', { x: 5.4, y: 6.25, w: 2.4, h: 0.3, fontSize: 18, color: C.cyan, bold: true, align: 'center', margin: 0 });
  footer(slide, 9);
}

pptx.writeFile({ fileName: 'LifeOS-Agent-路演PPT.pptx' });
