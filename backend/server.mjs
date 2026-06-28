import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_DIR = path.join(__dirname, "data");
const STATE_DIR = path.join(__dirname, ".lifeos-state");
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
  const [profile, memories, skills, logs, traces] = await Promise.all([
    readJson("profile.json", {}),
    readJson("memories.json", []),
    readJson("skills.json", []),
    readJson("logs.json", []),
    readJson("traces.json", [])
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

async function getState() {
  const [profile, memories, skills, logs, traces] = await Promise.all([
    readJson("profile.json", {}),
    readJson("memories.json", []),
    readJson("skills.json", []),
    readJson("logs.json", []),
    readJson("traces.json", [])
  ]);
  return {
    profile,
    memories,
    skills,
    logs,
    traces,
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
