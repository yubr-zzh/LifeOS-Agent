import http from "node:http";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_DIR = path.join(__dirname, "data");
const STATE_DIR = path.join(__dirname, ".lifeos-state");
const MEMORY_VAULT_DIR = path.join(STATE_DIR, "memory-vault");
const PORT = Number(process.env.LIFEOS_AGENT_PORT || 4399);

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

const today = () => new Date().toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

async function readJson(name, fallback) {
  const stateFile = path.join(STATE_DIR, name);
  if (existsSync(stateFile)) return JSON.parse(await readFile(stateFile, "utf8"));

  const seedFile = path.join(SEED_DIR, name);
  if (existsSync(seedFile)) return JSON.parse(await readFile(seedFile, "utf8"));

  return fallback;
}

async function writeJson(name, data) {
  await mkdir(STATE_DIR, { recursive: true });
  const file = path.join(STATE_DIR, name);
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function frontmatter(fields) {
  const lines = Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  return `---\n${lines.join("\n")}\n---\n\n`;
}

function safeFileName(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "memory";
}

async function writeMemoryFile(relativePath, content) {
  const file = path.join(MEMORY_VAULT_DIR, relativePath);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

async function listMarkdownFiles(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listMarkdownFiles(fullPath, base));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const relativePath = path.relative(base, fullPath).replaceAll("\\", "/");
      files.push({
        path: relativePath,
        content: await readFile(fullPath, "utf8")
      });
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function syncFileSystemMemory({ profile, memories, skills, traces, dreams = [], feedbacks = [] }) {
  await writeMemoryFile(
    "README.md",
    `${frontmatter({ type: "memory_vault", updated: nowIso() })}# LifeOS File-system Memory\n\n这个目录是 LifeOS Agent 的文件式系统内存。JSON store 负责机器读取，Markdown vault 负责人类审查、Agent 反思和长期沉淀。\n\n## 目录\n\n- \`profile.md\`：当前修士画像和境界\n- \`memories/\`：长期模式与目标记忆\n- \`skills/\`：功法 Skills 当前参数与进化记录\n- \`traces/\`：最近 Agent Harness trace 摘要\n- \`dreams/\`：Dreaming 离线反思报告\n- \`feedbacks/\`：用户反馈与二次进化记录\n`
  );

  await writeMemoryFile(
    "profile.md",
    `${frontmatter({ type: "profile", id: profile.id, updated: nowIso() })}# ${profile.name || "修士"}\n\n- 总境界：${profile.overallRealm || "未知"}\n- 总进度：${profile.totalProgress || 0}%\n\n## 长期目标\n\n${(profile.longTermGoals || []).map((goal) => `- ${goal}`).join("\n") || "- 暂无"}\n\n## 子境界\n\n${(profile.subRealms || []).map((realm) => `- ${realm.name}：${realm.realm}，${realm.progress}%`).join("\n")}\n\n## 稳定模式\n\n${(profile.patterns || []).map((pattern) => `- ${pattern}`).join("\n") || "- 暂无"}\n`
  );

  for (const memory of memories) {
    await writeMemoryFile(
      `memories/${safeFileName(memory.id)}.md`,
      `${frontmatter({ type: memory.type, id: memory.id, confidence: memory.confidence, updated: memory.lastUpdated })}# ${memory.id}\n\n${memory.content}\n\n## Evidence\n\n${(memory.evidence || []).map((item) => `- ${item}`).join("\n") || "- 暂无"}\n\n## Keywords\n\n${(memory.keywords || []).map((item) => `- ${item}`).join("\n") || "- 暂无"}\n`
    );
  }

  for (const skill of skills) {
    await writeMemoryFile(
      `skills/${safeFileName(skill.id)}.md`,
      `${frontmatter({ type: "skill", id: skill.id, score: skill.score, updated: nowIso() })}# ${skill.name}\n\n- Skill ID：${skill.id}\n- 类型：${skill.type}\n- 触发条件：${skill.trigger}\n- 评分：${skill.score}\n\n## Params\n\n\`\`\`json\n${JSON.stringify(skill.params, null, 2)}\n\`\`\`\n\n## Evolution Notes\n\n${(skill.evolutionNotes || []).map((note) => `- ${note.date}：${note.reason}`).join("\n") || "- 暂无"}\n`
    );
  }

  for (const trace of traces.slice(-5)) {
    await writeMemoryFile(
      `traces/${safeFileName(trace.traceId)}.md`,
      `${frontmatter({ type: "harness_trace", id: trace.traceId, updated: trace.timestamp })}# ${trace.traceId}\n\n## Input\n\n${trace.input}\n\n## Retrieved Memory\n\n${(trace.retrievedMemory || []).map((memory) => `- ${memory.content} (${memory.confidence})`).join("\n") || "- 暂无"}\n\n## Selected Skills\n\n${(trace.selectedSkills || []).map((skill) => `- ${skill.name} / ${skill.skillId} (${skill.score})`).join("\n") || "- 暂无"}\n\n## Evaluation\n\n\`\`\`json\n${JSON.stringify(trace.evaluation || {}, null, 2)}\n\`\`\`\n\n## Evolution\n\n${(trace.skillEvolution || []).map((change) => `- ${change.param}: ${change.from} -> ${change.to}`).join("\n") || "- 暂无"}\n`
    );
  }

  for (const dream of dreams.slice(-5)) {
    await writeMemoryFile(
      `dreams/${safeFileName(dream.dreamId)}.md`,
      `${frontmatter({ type: "dream_report", id: dream.dreamId, updated: dream.timestamp })}# Dream ${dream.dreamId}\n\n## Summary\n\n${dream.summary}\n\n## Observations\n\n${dream.observations.map((item) => `- ${item}`).join("\n")}\n\n## Memory Proposals\n\n${dream.memoryProposals.map((item) => `- ${item}`).join("\n")}\n\n## Skill Proposals\n\n${dream.skillProposals.map((item) => `- ${item}`).join("\n")}\n\n## Next Experiments\n\n${dream.nextExperiments.map((item) => `- ${item}`).join("\n")}\n`
    );
  }

  for (const feedback of feedbacks.slice(-10)) {
    await writeMemoryFile(
      `feedbacks/${safeFileName(feedback.feedbackId)}.md`,
      `${frontmatter({ type: "user_feedback", id: feedback.feedbackId, traceId: feedback.traceId, updated: feedback.timestamp })}# Feedback ${feedback.feedbackId}\n\n- Trace：${feedback.traceId}\n- Rating：${feedback.rating}\n- Plan Fit：${feedback.planFit}\n- Adopted：${feedback.adopted}\n\n## Note\n\n${feedback.note || "无"}\n\n## Evolution\n\n${(feedback.evolution || []).map((item) => `- ${item.param}: ${item.from} -> ${item.to}`).join("\n") || "- 暂无"}\n`
    );
  }
}

async function readBody(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  if (!body.trim()) return {};
  return JSON.parse(body);
}

function tokenize(text) {
  const lower = text.toLowerCase();
  const tokens = [
    "rag", "agent", "harness", "lifeos", "mvp",
    "算法", "项目", "学习", "下午", "上午", "晚上", "短视频",
    "分心", "焦虑", "没做完", "完成", "资料", "复盘", "计划"
  ];
  return tokens.filter((token) => lower.includes(token.toLowerCase()));
}

function parseInput(input) {
  const normalized = input.trim();
  const lower = normalized.toLowerCase();
  const topics = [];
  const achievements = [];
  const heartDemons = [];

  if (lower.includes("rag")) {
    topics.push("RAG");
    achievements.push("RAG 学习推进，已形成阶段性输入");
  }
  if (lower.includes("agent harness") || lower.includes("harness")) {
    topics.push("Agent Harness");
    achievements.push("Agent Harness 资料阅读完成 1 次");
  }
  if (lower.includes("lifeos")) {
    topics.push("LifeOS");
    achievements.push("LifeOS 项目思路清晰度提升");
  }
  if (normalized.includes("算法")) {
    topics.push("算法");
    if (normalized.includes("没做完") || normalized.includes("未完成")) {
      heartDemons.push("目标过大");
    } else {
      achievements.push("算法训练有推进");
    }
  }
  if (normalized.includes("短视频") || normalized.includes("刷")) heartDemons.push("下午分心");
  if (normalized.includes("焦虑")) heartDemons.push("焦虑感上升");
  if (normalized.includes("熬夜")) heartDemons.push("熬夜");
  if (normalized.includes("拖延")) heartDemons.push("拖延");
  if (normalized.includes("没做完") || normalized.includes("未完成")) heartDemons.push("计划完成受阻");

  return {
    rawInput: normalized,
    topics: [...new Set(topics)],
    achievements: achievements.length ? [...new Set(achievements)] : ["完成一次有效修炼记录"],
    heartDemons: [...new Set(heartDemons)],
    emotion: normalized.includes("焦虑") ? "轻度焦虑，但晚间状态有所回升" : "状态平稳，适合继续推进主线任务",
    tokens: tokenize(normalized)
  };
}

function retrieveMemory(parsed, memories) {
  return memories
    .map((memory) => {
      const hitCount = (memory.keywords || []).filter((keyword) =>
        parsed.rawInput.toLowerCase().includes(String(keyword).toLowerCase())
      ).length;
      const typeBoost = memory.type.includes("long") ? 0.12 : 0.04;
      return { ...memory, relevance: clamp(hitCount / Math.max(1, (memory.keywords || []).length) + typeBoost) };
    })
    .filter((memory) => memory.relevance > 0.05)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 4);
}

function selectSkills(parsed, skills) {
  const ids = new Set(["daily_reflection", "planning", "memory_consolidation"]);
  if (parsed.heartDemons.length) ids.add("obstacle_detection");
  if (parsed.topics.length) ids.add("learning_summary");
  if (parsed.rawInput.includes("项目") || parsed.rawInput.toLowerCase().includes("lifeos")) ids.add("project_breakdown");
  return [...ids].map((id) => skills.find((skill) => skill.id === id)).filter(Boolean);
}

function generateReflection(parsed, memories) {
  const hasAfternoonPattern = memories.some((memory) => memory.id === "mem_afternoon_focus");
  const tomorrowPlan = [
    "上午：安排 RAG / Agent Harness 深度学习 60-90 分钟",
    hasAfternoonPattern
      ? "下午：安排低认知任务，如整理笔记、拆解接口、补充 README"
      : "下午：安排 1 个可完成的小型项目任务",
    parsed.heartDemons.includes("目标过大")
      ? "晚间：算法题减少为 1 道，并用 15 分钟复盘降低启动阻力"
      : "晚间：完成 15 分钟修炼日志复盘"
  ];

  return {
    achievements: parsed.achievements,
    heartDemons: parsed.heartDemons.length ? parsed.heartDemons : ["暂无明显心魔"],
    emotion: parsed.emotion,
    projectProgress: parsed.rawInput.toLowerCase().includes("lifeos")
      ? "LifeOS Agent 主线推进，Agent 工程方向更明确"
      : "当前记录已入库，可用于后续成长轨迹分析",
    tomorrowPlan,
    summary: `本次修炼围绕 ${parsed.topics.join("、") || "日常成长"} 展开，系统已完成复盘、心魔识别与下一轮计划生成。`
  };
}

function evaluateRun(parsed, selectedSkills, retrievedMemory) {
  const planDifficulty = clamp(0.5 + parsed.heartDemons.length * 0.08 + (parsed.rawInput.includes("没做完") ? 0.08 : 0));
  const emotionalSupport = clamp(0.58 + (parsed.rawInput.includes("焦虑") ? 0.23 : 0.08));
  const goalAlignment = clamp(0.62 + (parsed.rawInput.toLowerCase().includes("lifeos") ? 0.18 : 0) + selectedSkills.length * 0.02);
  const memoryGrounding = clamp(0.45 + retrievedMemory.length * 0.12);
  return {
    planDifficulty: Number(planDifficulty.toFixed(2)),
    emotionalSupport: Number(emotionalSupport.toFixed(2)),
    goalAlignment: Number(goalAlignment.toFixed(2)),
    memoryGrounding: Number(memoryGrounding.toFixed(2))
  };
}

function upsertMemory(memories, memory) {
  const index = memories.findIndex((item) => item.id === memory.id);
  if (index >= 0) {
    memories[index] = {
      ...memories[index],
      ...memory,
      evidence: [...new Set([...(memories[index].evidence || []), ...(memory.evidence || [])])],
      confidence: Math.min(0.98, Math.max(memories[index].confidence || 0.5, memory.confidence || 0.5))
    };
  } else {
    memories.push(memory);
  }
}

function evolveMemory(parsed, memories) {
  const updates = [];
  if (parsed.rawInput.includes("下午") && (parsed.rawInput.includes("短视频") || parsed.rawInput.includes("分心"))) {
    const content = "用户下午容易分心，适合安排轻量整理任务；深度学习优先放在上午。";
    upsertMemory(memories, {
      id: "mem_afternoon_focus",
      type: "long_term_pattern",
      content,
      keywords: ["下午", "分心", "短视频", "效率"],
      confidence: 0.82,
      evidence: [today()],
      lastUpdated: today()
    });
    updates.push(`新增/更新：${content}`);
  }

  if (parsed.rawInput.toLowerCase().includes("lifeos")) {
    const content = "用户当前主线目标是完成 LifeOS Agent MVP，优先强化 Agent Harness、Memory、Skills 与自进化闭环。";
    upsertMemory(memories, {
      id: "mem_lifeos_goal",
      type: "long_term",
      content,
      keywords: ["LifeOS", "Agent", "Harness", "MVP", "黑客松"],
      confidence: 0.96,
      evidence: [today()],
      lastUpdated: today()
    });
    updates.push(`更新：${content}`);
  }

  if (!updates.length) {
    updates.push("本次记录未形成新的长期模式，短期日志已保存用于后续观察。");
  }
  return updates;
}

function evolveSkills(parsed, skills, evaluation) {
  const changes = [];
  const planning = skills.find((skill) => skill.id === "planning");
  if (planning && (evaluation.planDifficulty >= 0.68 || parsed.heartDemons.includes("目标过大"))) {
    const fromIntensity = planning.params.intensity;
    const fromGranularity = planning.params.taskGranularity;
    planning.params.intensity = Number(Math.max(0.55, fromIntensity - 0.2).toFixed(2));
    planning.params.taskGranularity = "small";
    planning.score = Number(Math.min(0.95, planning.score + 0.01).toFixed(2));
    planning.evolutionNotes.push({
      date: today(),
      reason: "检测到计划难度偏高或目标过大，降低强度并拆小任务。"
    });
    changes.push({ param: "planning.intensity", from: fromIntensity, to: planning.params.intensity });
    changes.push({ param: "planning.taskGranularity", from: fromGranularity, to: planning.params.taskGranularity });
  }

  const obstacle = skills.find((skill) => skill.id === "obstacle_detection");
  if (obstacle && parsed.heartDemons.length >= 2) {
    const from = obstacle.params.sensitivity;
    obstacle.params.sensitivity = Number(Math.min(0.9, from + 0.03).toFixed(2));
    obstacle.score = Number(Math.min(0.95, obstacle.score + 0.01).toFixed(2));
    obstacle.evolutionNotes.push({
      date: today(),
      reason: "本次记录出现多个心魔，提高识别敏感度。"
    });
    changes.push({ param: "obstacle_detection.sensitivity", from, to: obstacle.params.sensitivity });
  }

  return changes.length ? changes : [{ param: "skill.evolution", from: "no_change", to: "stable" }];
}

function updateProfile(profile, parsed) {
  const deltas = new Map();
  if (parsed.topics.includes("Agent Harness") || parsed.topics.includes("RAG")) deltas.set("AI Agent 技术栈", 3);
  if (parsed.rawInput.toLowerCase().includes("lifeos")) deltas.set("项目实战", 2);
  if (parsed.rawInput.includes("算法") && !parsed.rawInput.includes("没做完")) deltas.set("算法能力", 2);
  if (parsed.heartDemons.includes("下午分心") || parsed.heartDemons.includes("焦虑感上升")) deltas.set("作息与健康", -1);

  profile.subRealms = profile.subRealms.map((realm) => ({
    ...realm,
    progress: Math.max(0, Math.min(100, realm.progress + (deltas.get(realm.name) || 0)))
  }));

  const positiveDelta = [...deltas.values()].filter((delta) => delta > 0).reduce((sum, delta) => sum + delta, 0);
  const negativeDelta = [...deltas.values()].filter((delta) => delta < 0).reduce((sum, delta) => sum + delta, 0);
  const totalDelta = Math.max(0, Math.round((positiveDelta + negativeDelta) / 2));
  profile.totalProgress = Math.max(0, Math.min(100, (profile.totalProgress || 0) + totalDelta));
  return profile;
}

function buildTrace({ input, parsed, retrievedMemory, selectedSkills, reflection, evaluation, memoryUpdates, skillEvolution }) {
  return {
    traceId: `trace_${Date.now()}`,
    timestamp: nowIso(),
    input,
    retrievedMemory: retrievedMemory.map((memory) => ({
      content: memory.content,
      type: memory.type,
      confidence: memory.confidence,
      lastUpdated: memory.lastUpdated
    })),
    selectedSkills: selectedSkills.map((skill) => ({
      name: skill.name,
      skillId: skill.id,
      trigger: skill.trigger,
      score: skill.score
    })),
    agentOutput: {
      reflection: reflection.summary,
      nextPlan: reflection.tomorrowPlan
    },
    evaluation,
    memoryUpdates,
    skillEvolution,
    parsedSignals: {
      topics: parsed.topics,
      heartDemons: parsed.heartDemons,
      tokens: parsed.tokens
    }
  };
}

async function runLifeOSAgent(input) {
  const [profile, memories, skills, logs, traces, dreams, feedbacks] = await Promise.all([
    readJson("profile.json", {}),
    readJson("memories.json", []),
    readJson("skills.json", []),
    readJson("logs.json", []),
    readJson("traces.json", []),
    readJson("dreams.json", []),
    readJson("feedbacks.json", [])
  ]);

  const parsed = parseInput(input);
  const retrievedMemory = retrieveMemory(parsed, memories);
  const selectedSkills = selectSkills(parsed, skills);
  const reflection = generateReflection(parsed, retrievedMemory);
  const evaluation = evaluateRun(parsed, selectedSkills, retrievedMemory);
  const memoryUpdates = evolveMemory(parsed, memories);
  const skillEvolution = evolveSkills(parsed, skills, evaluation);
  const nextProfile = updateProfile(profile, parsed);
  const trace = buildTrace({
    input,
    parsed,
    retrievedMemory,
    selectedSkills,
    reflection,
    evaluation,
    memoryUpdates,
    skillEvolution
  });

  const dailyLog = {
    id: `log_${Date.now()}`,
    date: today(),
    rawInput: input,
    summary: reflection.summary,
    achievements: reflection.achievements,
    obstacles: reflection.heartDemons,
    emotions: [reflection.emotion],
    nextActions: reflection.tomorrowPlan,
    traceId: trace.traceId
  };

  logs.push(dailyLog);
  traces.push(trace);
  await Promise.all([
    writeJson("profile.json", nextProfile),
    writeJson("memories.json", memories),
    writeJson("skills.json", skills),
    writeJson("logs.json", logs.slice(-100)),
    writeJson("traces.json", traces.slice(-100))
  ]);
  await syncFileSystemMemory({ profile: nextProfile, memories, skills, traces, dreams, feedbacks });

  const parsedJournal = {
    achievements: reflection.achievements,
    heartDemons: reflection.heartDemons,
    emotion: reflection.emotion,
    projectProgress: reflection.projectProgress,
    tomorrowPlan: reflection.tomorrowPlan,
    skillsUsed: selectedSkills.map((skill) => `${skill.name} (${skill.id})`),
    memoryUpdates
  };

  return {
    parsedJournal,
    harnessTrace: trace,
    profile: nextProfile,
    dailyLog
  };
}

async function runDreaming() {
  const [profile, memories, skills, logs, traces, dreams, feedbacks] = await Promise.all([
    readJson("profile.json", {}),
    readJson("memories.json", []),
    readJson("skills.json", []),
    readJson("logs.json", []),
    readJson("traces.json", []),
    readJson("dreams.json", []),
    readJson("feedbacks.json", [])
  ]);

  const recentTraces = traces.slice(-5);
  const recentLogs = logs.slice(-7);
  const repeatedHeartDemons = new Map();
  const selectedSkillCounts = new Map();

  for (const trace of recentTraces) {
    for (const demon of trace.parsedSignals?.heartDemons || []) {
      repeatedHeartDemons.set(demon, (repeatedHeartDemons.get(demon) || 0) + 1);
    }
    for (const skill of trace.selectedSkills || []) {
      selectedSkillCounts.set(skill.skillId, (selectedSkillCounts.get(skill.skillId) || 0) + 1);
    }
  }

  const topDemons = [...repeatedHeartDemons.entries()].sort((a, b) => b[1] - a[1]);
  const topSkills = [...selectedSkillCounts.entries()].sort((a, b) => b[1] - a[1]);
  const hasAfternoonDemon = topDemons.some(([name]) => String(name).includes("下午") || String(name).includes("分心"));

  const observations = [
    recentTraces.length
      ? `最近 ${recentTraces.length} 次 Agent run 已形成可回放 Harness trace。`
      : "当前还没有足够 trace，Dreaming 进入冷启动观察模式。",
    topDemons.length
      ? `高频心魔：${topDemons.map(([name, count]) => `${name} x${count}`).join("、")}。`
      : "近期没有明显重复心魔。",
    topSkills.length
      ? `高频功法：${topSkills.map(([name, count]) => `${name} x${count}`).join("、")}。`
      : "近期功法调用样本不足。"
  ];

  const memoryProposals = [];
  if (hasAfternoonDemon) {
    memoryProposals.push("巩固长期模式：下午适合低认知整理任务，上午适合深度学习和核心项目推进。");
    upsertMemory(memories, {
      id: "mem_dream_afternoon_strategy",
      type: "dream_consolidated_pattern",
      content: "Dreaming 发现下午分心模式重复出现，建议将下午默认规划为整理、复盘、轻量阅读和低风险工程任务。",
      keywords: ["dreaming", "下午", "分心", "计划"],
      confidence: 0.84,
      evidence: recentTraces.map((trace) => trace.traceId),
      lastUpdated: today()
    });
  } else {
    memoryProposals.push("继续观察执行节律，暂不新增强约束长期模式。");
  }

  const skillProposals = [];
  const planning = skills.find((skill) => skill.id === "planning");
  if (planning) {
    const from = planning.params.reviewCadence || "daily";
    planning.params.reviewCadence = hasAfternoonDemon ? "daily_micro_review" : "daily";
    planning.evolutionNotes.push({
      date: today(),
      reason: "Dreaming 根据近期 trace 调整计划复盘节奏。"
    });
    skillProposals.push(`planning.reviewCadence: ${from} -> ${planning.params.reviewCadence}`);
  }

  const memorySkill = skills.find((skill) => skill.id === "memory_consolidation");
  if (memorySkill) {
    const from = memorySkill.params.fileSystemSync || false;
    memorySkill.params.fileSystemSync = true;
    memorySkill.evolutionNotes.push({
      date: today(),
      reason: "Dreaming 启用文件式系统内存同步，便于审查和长期沉淀。"
    });
    skillProposals.push(`memory_consolidation.fileSystemSync: ${from} -> true`);
  }

  const nextExperiments = [
    "明日深度任务默认安排在上午，并限制为 1 个主线目标。",
    "下午只安排整理、复盘、接口打磨或文档任务。",
    "下一次 Journal run 后对比 planDifficulty 与 emotionalSupport 是否改善。"
  ];

  const dream = {
    dreamId: `dream_${Date.now()}`,
    timestamp: nowIso(),
    summary: "Dreaming 完成一次离线反思：将近期 Harness traces 压缩为长期记忆、Skill 参数调整和下一轮实验。",
    observations,
    memoryProposals,
    skillProposals,
    nextExperiments,
    sourceTraceIds: recentTraces.map((trace) => trace.traceId),
    sourceLogIds: recentLogs.map((log) => log.id)
  };

  dreams.push(dream);
  await Promise.all([
    writeJson("memories.json", memories),
    writeJson("skills.json", skills),
    writeJson("dreams.json", dreams.slice(-50))
  ]);
  await syncFileSystemMemory({ profile, memories, skills, traces, dreams, feedbacks });

  return {
    dream,
    memoryFiles: await listMarkdownFiles(MEMORY_VAULT_DIR)
  };
}

async function submitFeedback({ traceId, rating, planFit = "unknown", adopted = "unknown", note = "" }) {
  const [profile, memories, skills, logs, traces, dreams, feedbacks] = await Promise.all([
    readJson("profile.json", {}),
    readJson("memories.json", []),
    readJson("skills.json", []),
    readJson("logs.json", []),
    readJson("traces.json", []),
    readJson("dreams.json", []),
    readJson("feedbacks.json", [])
  ]);

  const trace = traces.find((item) => item.traceId === traceId) || traces.at(-1);
  if (!trace) {
    throw new Error("No trace available for feedback");
  }

  const evolution = [];
  const planning = skills.find((skill) => skill.id === "planning");
  if (planning && (rating === "too_hard" || planFit === "too_heavy")) {
    const fromIntensity = planning.params.intensity;
    const fromGranularity = planning.params.taskGranularity;
    planning.params.intensity = Number(Math.max(0.45, fromIntensity - 0.1).toFixed(2));
    planning.params.taskGranularity = "micro";
    planning.score = Number(Math.min(0.98, planning.score + 0.01).toFixed(2));
    planning.evolutionNotes.push({
      date: today(),
      reason: "用户反馈计划过重，降低计划强度并改为微任务粒度。"
    });
    evolution.push({ param: "planning.intensity", from: fromIntensity, to: planning.params.intensity });
    evolution.push({ param: "planning.taskGranularity", from: fromGranularity, to: planning.params.taskGranularity });
    upsertMemory(memories, {
      id: "mem_feedback_prefers_micro_tasks",
      type: "feedback_consolidated_pattern",
      content: "用户反馈在压力或焦虑状态下更适合微任务计划，而不是高强度整块安排。",
      keywords: ["feedback", "计划", "微任务", "压力"],
      confidence: 0.8,
      evidence: [trace.traceId],
      lastUpdated: today()
    });
  }

  if (rating === "helpful" || rating === "just_right") {
    for (const selected of trace.selectedSkills || []) {
      const skill = skills.find((item) => item.id === selected.skillId);
      if (!skill) continue;
      const from = skill.score;
      skill.score = Number(Math.min(0.98, skill.score + 0.015).toFixed(3));
      skill.evolutionNotes.push({
        date: today(),
        reason: `用户反馈 ${rating}，增强本次被调用功法的置信度。`
      });
      evolution.push({ param: `${skill.id}.score`, from, to: skill.score });
    }
  }

  if (rating === "not_helpful") {
    upsertMemory(memories, {
      id: "mem_feedback_needs_concrete_actions",
      type: "feedback_consolidated_pattern",
      content: "用户反馈建议不够有帮助时，后续计划需要更具体、可执行，并减少抽象鼓励性表达。",
      keywords: ["feedback", "具体", "可执行", "计划"],
      confidence: 0.76,
      evidence: [trace.traceId],
      lastUpdated: today()
    });
    evolution.push({ param: "planning.outputStyle", from: "balanced", to: "concrete_actions" });
  }

  const feedback = {
    feedbackId: `feedback_${Date.now()}`,
    timestamp: nowIso(),
    traceId: trace.traceId,
    rating,
    planFit,
    adopted,
    note,
    evolution
  };

  trace.userFeedback = feedback;
  trace.feedbackEvolution = evolution;
  feedbacks.push(feedback);

  await Promise.all([
    writeJson("memories.json", memories),
    writeJson("skills.json", skills),
    writeJson("traces.json", traces.slice(-100)),
    writeJson("feedbacks.json", feedbacks.slice(-100))
  ]);
  await syncFileSystemMemory({ profile, memories, skills, traces, dreams, feedbacks });

  return {
    feedback,
    updatedTrace: trace,
    skillEvolution: evolution,
    memoryFiles: await listMarkdownFiles(MEMORY_VAULT_DIR)
  };
}

async function runDemoMode() {
  const input = "今天学了 RAG，但是下午刷短视频浪费了两小时。算法题没做完，有点焦虑。晚上看了一点 Agent Harness 的资料，感觉 LifeOS 项目思路清楚了一些。";
  const run = await runLifeOSAgent(input);
  const feedback = await submitFeedback({
    traceId: run.harnessTrace.traceId,
    rating: "too_hard",
    planFit: "too_heavy",
    adopted: "partially",
    note: "计划方向有用，但任务粒度偏大，明天更适合微任务。"
  });
  const dream = await runDreaming();
  const state = await getState();

  return {
    input,
    run,
    feedback,
    dream: dream.dream,
    memoryFiles: dream.memoryFiles,
    state
  };
}

async function getState() {
  const [profile, memories, skills, logs, traces, dreams, feedbacks] = await Promise.all([
    readJson("profile.json", {}),
    readJson("memories.json", []),
    readJson("skills.json", []),
    readJson("logs.json", []),
    readJson("traces.json", []),
    readJson("dreams.json", []),
    readJson("feedbacks.json", [])
  ]);
  return {
    profile,
    memories,
    skills,
    logs,
    traces,
    dreams,
    feedbacks,
    latestTrace: traces.at(-1) || null
  };
}

function send(res, status, data) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, jsonHeaders);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/api/health") {
      send(res, 200, { ok: true, service: "lifeos-agent-backend", timestamp: nowIso() });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/lifeos/state") {
      send(res, 200, await getState());
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/lifeos/traces/latest") {
      const state = await getState();
      send(res, 200, { trace: state.latestTrace });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/lifeos/memory-files") {
      const state = await getState();
      await syncFileSystemMemory(state);
      send(res, 200, { files: await listMarkdownFiles(MEMORY_VAULT_DIR) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/lifeos/dream") {
      send(res, 200, await runDreaming());
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/lifeos/feedback") {
      const body = await readBody(req);
      if (!body.rating || typeof body.rating !== "string") {
        send(res, 400, { error: "rating is required" });
        return;
      }
      send(res, 200, await submitFeedback(body));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/lifeos/demo") {
      send(res, 200, await runDemoMode());
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/lifeos/run") {
      const body = await readBody(req);
      if (!body.input || typeof body.input !== "string") {
        send(res, 400, { error: "input is required" });
        return;
      }
      send(res, 200, await runLifeOSAgent(body.input));
      return;
    }

    send(res, 404, { error: "not found" });
  } catch (error) {
    send(res, 500, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`LifeOS Agent backend listening on http://127.0.0.1:${PORT}`);
});
