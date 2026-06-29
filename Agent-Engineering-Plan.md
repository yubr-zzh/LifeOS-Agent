# LifeOS Agent 工程实施规划

## 总目标

把前端 mock 演示升级为真实 Agent 工程闭环：

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

第一版不依赖真实 LLM，采用可解释规则引擎实现稳定演示。后续可以把 `Reflection / Plan Generation` 节点替换成 LLM，而 Harness、Memory、Skills、Trace 数据结构保持不变。

## Step 1：后端工程骨架

**Goal**：建立可运行的 Agent 工程服务，而不是前端 mock。

交付：

- `backend/server.mjs`
- `backend/package.json`
- `backend/data/*.json` seed 数据
- `backend/.lifeos-state/` 运行时状态目录

验收：

- `node --check backend/server.mjs`
- `GET /api/health` 返回正常

## Step 2：Memory Store

**Goal**：让 Agent 的建议能被长期上下文解释。

交付：

- 长期目标 memory
- 下午分心模式 memory
- 项目动机模式 memory
- 运行时 memory upsert 逻辑

验收：

- 输入包含“下午 / 短视频 / 分心”时，更新 `mem_afternoon_focus`
- 输入包含 `LifeOS` 时，更新主线目标 memory

## Step 3：Skill Registry

**Goal**：把“功法”落实为可调用、可评分、可进化的 Skills。

交付：

- 每日复盘诀 `daily_reflection`
- 心魔照见法 `obstacle_detection`
- 周天规划术 `planning`
- 记忆凝练术 `memory_consolidation`
- 知识炼化术 `learning_summary`
- 项目破阵诀 `project_breakdown`

验收：

- 每次运行都会选择一组 skills
- 计划过重时 `planning.intensity` 下降
- 多个心魔出现时 `obstacle_detection.sensitivity` 提升

## Step 4：Agent Orchestrator

**Goal**：把输入处理成一次完整 Agent run。

交付：

- 输入解析
- memory retrieval
- skill selection
- reflection generation
- planning generation
- evaluation
- memory evolution
- skill evolution

验收：

- `POST /api/lifeos/run` 返回 `parsedJournal` 和 `harnessTrace`
- 返回结果可以直接驱动前端 Journal 和 Harness 页面

## Step 5：Harness Trace

**Goal**：让自进化过程可观测、可复盘、可展示。

交付：

- `traceId`
- raw input
- retrieved memory
- selected skills
- agent output
- evaluation metrics
- memory updates
- skill evolution changes
- parsed signals

验收：

- `GET /api/lifeos/traces/latest` 能拿到最近一次 trace
- Harness 页面优先展示真实 trace

## Step 6：前端接入

**Goal**：让前端从静态 mock 变成 live demo。

交付：

- `frontend/src/lib/api.ts`
- Journal 页面调用后端
- Harness 页面读取最近 trace
- 后端不可用时 fallback 到 mock

验收：

- 提交日志后，Journal 结果来自后端
- 切到 Harness 页面，展示同一次运行的 trace

## 下一阶段目标

## Step 7：Dreaming 机制

**Goal**：让 Agent 不只在用户输入时响应，也能在“离线时间”压缩近期轨迹、沉淀长期洞察、提出下一轮实验。

交付：

- `POST /api/lifeos/dream`
- dream report
- 从最近 traces/logs 生成 observations
- 生成 memory proposals
- 生成 skill proposals
- 写入文件式 memory vault

验收：

- 先运行一次 `POST /api/lifeos/run`
- 再运行 `POST /api/lifeos/dream`
- 返回 dream report
- `backend/.lifeos-state/memory-vault/dreams/*.md` 出现离线反思文件

## Step 8：文件式系统内存

**Goal**：让 Memory 不只是数据库字段，而是可审查、可编辑、可被 Agent 重新读取的文件系统知识库。

交付：

- `GET /api/lifeos/memory-files`
- `memory-vault/README.md`
- `profile.md`
- `memories/*.md`
- `skills/*.md`
- `traces/*.md`
- `dreams/*.md`

验收：

- 每次 run 后同步 profile/memory/skill/trace 文件
- 每次 dream 后同步 dream report 文件
- Harness 页面能展示文件列表和内容摘要

## 后续目标

## Step 9：用户反馈驱动的二次进化

**Goal**：让自进化不只来自系统自评和 Dreaming，也来自用户对计划是否可执行的真实反馈。

交付：

- `POST /api/lifeos/feedback`
- feedback record
- trace.userFeedback
- trace.feedbackEvolution
- feedbacks/*.md 文件式记忆
- Journal 页面反馈按钮

验收：

- 先运行 `POST /api/lifeos/run`
- 再提交 `rating=too_hard`
- `planning.intensity` 下降
- `planning.taskGranularity` 变成 `micro`
- `feedbacks/*.md` 生成反馈记忆文件

## Step 10：一键 Demo Mode 与 Live 可视化

**Goal**：让路演现场稳定复现完整链路，不需要手动依次点 Journal、Feedback、Dreaming。

交付：

- `POST /api/lifeos/demo`
- 自动执行 `run → feedback → dreaming`
- 返回 state、trace、feedback、dream、memory files
- Dashboard 读取 live profile/logs/traces
- Timeline 读取 live logs/traces/dreams/feedbacks
- Harness 页面提供一键演示按钮

验收：

- 点击 Harness 的“一键演示完整闭环”
- Dashboard 总进度和子境界更新
- Timeline 新增修炼、反馈、Dreaming 节点
- Harness 展示最新真实 trace 和 memory vault

## Step 11：LLM 化核心节点

**Goal**：将规则模拟升级为可插拔真实模型节点，同时保留规则 fallback，保证路演现场稳定。

交付：

- `.env.example`
- 后端 `.env` 自动加载
- DeepSeek/OpenAI-compatible JSON LLM adapter
- `reflection_generation` LLM 节点
- `dreaming_synthesis` LLM 节点
- `GET /api/lifeos/config`
- trace/dream 记录 `modelCalls`
- Harness 显示 LLM / vision / model call 状态

验收：

- 未配置 key 时，系统继续使用规则 fallback
- 配置 key 后，reflection 与 dreaming 由真实 LLM 输出增强
- API 不返回任何 secret，只返回 `hasApiKey`
- `npm run check` 通过

## 后续目标

## Step 12：Harness 工程证据链

**Goal**：让每次 Agent run 都可观测、可回放、可解释，不只展示最终回答。

交付：

- `harnessTrace.traceSteps`
- 每个节点记录 `inputSummary / outputSummary / latencyMs / status`
- `harnessTrace.stateDiff`
- Memory diff：新增、更新、数量变化
- Profile diff：总境界与子境界变化
- Skill diff：参数进化记录
- smoke test 校验 traceSteps 与 stateDiff

验收：

- `POST /api/lifeos/run` 返回完整 pipeline steps
- `traceSteps` 至少包含 parse、retrieval、skill、reflection、evaluation、memory、skill evolution、profile、persistence
- 最新 trace 持久化后仍包含 persistence step

## 后续目标

1. 前端 Harness 面板展示每个节点耗时、输入输出、状态差异。
2. 接入豆包视觉模型：图片日记、白板截图、学习材料截图进入 multimodal memory。
3. 准备路演 README、PPT 文案和固定演示脚本。
