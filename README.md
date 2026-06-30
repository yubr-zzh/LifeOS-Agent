# LifeOS Agent

融修仙之框架，铸 Agent 工程之核。

LifeOS Agent 是一个面向个人长期成长的伴随式自进化 Agent。它不是普通日程或打卡工具，而是把日常记录、复盘、计划、长期记忆、技能选择、反馈进化与可视化成长轨迹连接成一个完整闭环：用户每天输入学习、项目、情绪和卡点，系统通过 Agent Harness 记录每一次运行链路，通过 Memory 沉淀长期画像，通过 Skills 调用可复用成长方法，并通过 Dreaming 与反馈机制持续优化后续建议。

## 项目亮点

1. **伴随式 LifeOS**  
   以“洞府、修炼日志、境界、心魔、功法、命运长河”等修仙概念承载真实产品功能，让长期成长变得可感知、可追踪、可复盘。

2. **Agent Harness 工程闭环**  
   每一次 LifeOS run 都会被拆解为可观测节点：输入解析、Memory 检索、Skill 选择、计划生成、评估、状态变化与持久化。系统不只给答案，还能展示 Agent 为什么这样建议、下一次如何调整。

3. **文件式系统内存**  
   Memory 不只是向量检索或黑箱摘要，而是可审查、可编辑、可回放的文件式记忆范式，面向长期目标、重复模式、技能熟练度、Dreaming 报告和运行 trace 建立个人成长档案。

4. **Skills / 功法注册表**  
   将“每日复盘、周天规划、心魔识别、记忆凝练、知识炼化、项目拆解”等能力抽象为可选择、可评分、可进化的 Agent Skills。

5. **Dreaming 自进化机制**  
   Dreaming 会离线读取近期 logs、traces、feedbacks，把短期运行结果压缩为长期记忆和下一轮策略实验，让 Agent 逐步适应用户的真实节奏。

6. **蓝紫极客风可视化产品体验**  
   前端提供洞府总览、修炼日志、成长轨迹、Harness 内核舱、多主题视觉体系等页面，把抽象 Agent 工程变成可演示、可理解的产品体验。

## 核心链路

```text
Daily Input
→ Memory Retrieval
→ Skill Selection
→ Reflection / Plan Generation
→ Harness Evaluation
→ Memory Update
→ Skill Evolution
→ Trace Persistence
→ Frontend Visualization
```

## 修仙框架映射

| 修仙概念 | LifeOS 映射 | 产品含义 |
| --- | --- | --- |
| 洞府 | 个人成长工作台 | 首页、可视化空间、长期状态总览 |
| 修炼日志 | 日常记录 | 用户每天输入学习、项目、情绪、困惑 |
| 境界 / 子境界 | 成长阶段 | 稳定执行、复盘质量、项目推进、心魔改善和 Skill 熟练度的综合结果 |
| 功法 | Agent Skills | 可复用的成长方法和工作流 |
| 心魔 | 阻碍模式 | 拖延、焦虑、熬夜、分心、目标过大等长期模式 |
| 命运长河 | 成长时间线 | 长期记录、成果、低谷、突破的可视化轨迹 |
| 灵根 | 用户画像 | 学习偏好、能力倾向、精力节律 |
| 阵法 | 多 Skill 编排 | 多个技能组合成的 Agent 工作流 |

## 技术架构

```text
frontend/
  React + Vite + Tailwind CSS
  Dashboard / Journal / Timeline / Harness views

backend/
  Node.js HTTP service
  Agent Orchestrator
  Memory Store
  Skill Registry
  Harness Trace
  Feedback Evolution
  Dreaming Engine

backend/data/
  Seed memories, skills, profile, traces, logs, dreams

backend/.lifeos-state/
  Runtime state and file-system memory vault
  Ignored by git
```

## 快速启动

### 1. 安装依赖

```bash
npm install
npm --prefix frontend install
```

后端当前使用 Node.js 内置能力，不需要额外安装依赖。

### 2. 配置环境变量

复制 `.env.example` 为本地 `.env`，并填入自己的模型密钥：

```bash
cp .env.example .env
```

重要：`.env` 已被 `.gitignore` 忽略，不要提交真实 API Key。

### 3. 启动后端

```bash
npm run backend:dev
```

默认端口：`4399`

### 4. 启动前端

```bash
npm run frontend:dev
```

默认前端地址：`http://127.0.0.1:5173/`

## 常用脚本

```bash
npm run check
npm run backend:check
npm run frontend:check
npm run frontend:build
npm run backend:smoke
npm run backend:smoke:dream
npm run backend:smoke:feedback
npm run backend:smoke:demo
npm run backend:smoke:config
```

## API 能力概览

后端提供以下核心能力：

- 健康检查：确认 LifeOS Agent Runtime 是否在线
- 日志处理：提交 daily input，触发一次完整 Agent run
- Trace 回放：展示 Harness 节点、输入输出摘要、耗时和 state diff
- Feedback Evolution：根据用户反馈调整计划策略与 Skill 参数
- Dreaming：离线压缩近期运行记录，生成长期记忆和下一轮实验方向
- 配置检查：检查 LLM / Vision 接入配置是否完整

## 路演与文档

- `LifeOS-Agent-PRD.md`：正式 PRD、技术架构与 MVP 开发清单
- `Agent-Engineering-Plan.md`：Agent 工程实施规划
- `LifeOS-Agent-PRD.pdf`：PRD PDF 版本
- `LifeOS-Agent-路演PPT.pptx`：4-5 分钟路演 PPT
- `scripts/build-lifeos-pitch.cjs`：路演 PPT 生成脚本

## 项目结构

```text
.
├── backend/                 # LifeOS Agent backend runtime
│   ├── data/                # Seed data
│   ├── scripts/             # Smoke tests
│   └── server.mjs           # Agent service
├── frontend/                # React + Vite frontend
│   └── src/
│       ├── components/      # Dashboard, Journal, Timeline, Harness
│       ├── lib/             # API and mock data
│       └── utils/
├── scripts/                 # Presentation generation
├── tools/                   # Document/PDF tooling
├── Agent-Engineering-Plan.md
├── LifeOS-Agent-PRD.md
└── LifeOS-Agent-路演PPT.pptx
```

## 当前定位

LifeOS Agent 的核心竞争点不在“修仙皮肤”，而在把个人成长抽象为可运行的 Agent 系统：

- 有长期记忆，而不是一次性聊天。
- 有 Skills 编排，而不是固定模板。
- 有 Harness 证据链，而不是黑箱建议。
- 有 Dreaming 与反馈自进化，而不是静态规则。
- 有可视化成长空间，而不是普通任务列表。

这使它更像一个面向个人成长的操作系统雏形：每天记录一点，长期变成一个真正理解用户的智能体。
