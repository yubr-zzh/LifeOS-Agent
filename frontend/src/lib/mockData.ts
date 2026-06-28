export interface Memory {
  content: string;
  type: 'short_term' | 'long_term' | 'pattern';
  confidence: number;
  lastUpdated: string;
}

export interface Skill {
  name: string;
  skillId: string;
  trigger: string;
  score: number;
}

export interface TimelineNode {
  id: number;
  date: string;
  title: string;
  type: 'breakthrough' | 'heart_demon' | 'record';
  description: string;
}

export interface SubRealm {
  name: string;
  level: string;
  progress: number;
  color: string;
}

export interface HeartDemon {
  name: string;
  intensity: number;
}

export const mockData = {
  cultivatorName: "玄灵子",
  currentRealm: "练气六层",
  totalProgress: 52,
  
  subRealms: [
    { name: "AI Agent 技术栈", level: "练气八层", progress: 68, color: "#6366f1" },
    { name: "算法能力", level: "练气四层", progress: 32, color: "#8b5cf6" },
    { name: "项目实战", level: "练气七层", progress: 55, color: "#a78bfa" },
    { name: "英语表达", level: "练气二层", progress: 15, color: "#c084fc" },
    { name: "作息与健康", level: "练气三层", progress: 28, color: "#e0bbff" },
  ] as SubRealm[],

  todayTasks: [
    { id: 1, title: "完成 RAG 向量检索优化", completed: true },
    { id: 2, title: "阅读 Agent Harness 论文 15页", completed: false },
    { id: 3, title: "进行 25 分钟专注冥想", completed: false },
    { id: 4, title: "复盘昨日心魔记录", completed: true },
  ],

  heartDemons: [
    { name: "下午分心", intensity: 85 },
    { name: "目标过大", intensity: 62 },
    { name: "焦虑感上升", intensity: 74 },
  ] as HeartDemon[],

  recentBreakthroughs: [
    "完成 RAG 模块初版",
    "Agent Harness 设计稿定稿",
    "记忆检索准确率提升 23%",
  ],

  journalInputExample: "今天学了 RAG，但是下午刷短视频浪费了两小时。\n算法题没做完，有点焦虑。\n晚上看了一点 Agent Harness 的资料，感觉 LifeOS 项目思路清楚了一些。",

  parsedJournal: {
    achievements: [
      "RAG 学习推进约 40%",
      "Agent Harness 资料阅读完成 1 次",
      "LifeOS 项目整体思路清晰度提升"
    ],
    heartDemons: ["下午分心", "目标过大", "焦虑感上升"],
    emotion: "轻度焦虑，傍晚有所回升",
    projectProgress: "LifeOS Agent 设计阶段推进中",
    tomorrowPlan: [
      "上午：RAG 深度学习（2小时专注）",
      "下午：整理笔记（低认知任务）",
      "晚间：算法 1 道 + 复盘 15 分钟"
    ],
    skillsUsed: [
      "每日复盘诀 (daily_reflection)",
      "心魔照见法 (obstacle_detection)",
      "周天规划术 (planning)",
      "记忆凝练术 (memory_consolidation)"
    ],
    memoryUpdates: [
      "新增：用户下午容易分心，适合安排轻量整理任务",
      "更新：用户当前主线目标为完成 LifeOS Agent MVP"
    ]
  },

  timeline: [
    {
      id: 1,
      date: "2026-06-20",
      title: "开始 LifeOS Agent 项目构思",
      type: "record",
      description: "确立以修仙隐喻为核心的产品概念"
    },
    {
      id: 2,
      date: "2026-06-22",
      title: "心魔爆发",
      type: "heart_demon",
      description: "连续两天拖延，未能完成原型设计"
    },
    {
      id: 3,
      date: "2026-06-24",
      title: "突破：完成核心 PRD",
      type: "breakthrough",
      description: "详细梳理 Memory / Skill / Harness 三层架构"
    },
    {
      id: 4,
      date: "2026-06-26",
      title: "RAG 模块初版完成",
      type: "breakthrough",
      description: "向量数据库与检索链路打通"
    },
    {
      id: 5,
      date: "2026-06-28",
      title: "今日修炼记录",
      type: "record",
      description: "Agent Harness 深度学习与系统优化"
    }
  ] as TimelineNode[],

  radarData: {
    dimensions: ["技术深度", "项目推进", "学习稳定性", "心魔控制", "规划能力"],
    values: [78, 65, 82, 54, 71]
  },

  harnessTrace: {
    traceId: "trace_001",
    input: "今天学了 RAG，但是下午刷短视频浪费了两小时。算法题没做完，有点焦虑。晚上看了一点 Agent Harness 的资料，感觉 LifeOS 项目思路清楚了一些。",
    retrievedMemory: [
      {
        content: "用户最近 3 次下午学习效率较低",
        type: "long_term_pattern" as const,
        confidence: 0.78,
        lastUpdated: "2026-06-26"
      },
      {
        content: "用户当前主线目标是完成 LifeOS Agent MVP",
        type: "long_term" as const,
        confidence: 0.95,
        lastUpdated: "2026-06-24"
      }
    ],
    selectedSkills: [
      {
        name: "每日复盘诀",
        skillId: "daily_reflection",
        trigger: "用户提交每日记录",
        score: 0.82
      },
      {
        name: "心魔照见法",
        skillId: "obstacle_detection",
        trigger: "检测到分心+焦虑模式",
        score: 0.76
      },
      {
        name: "周天规划术",
        skillId: "planning",
        trigger: "需要生成明日计划",
        score: 0.88
      },
      {
        name: "记忆凝练术",
        skillId: "memory_consolidation",
        trigger: "本次记录包含新模式",
        score: 0.79
      }
    ],
    evaluation: {
      planDifficulty: 0.72,
      emotionalSupport: 0.81,
      goalAlignment: 0.88
    },
    memoryUpdates: [
      "新增：用户下午容易分心，适合安排轻量整理任务",
      "更新：planning.intensity 建议调低至 0.6"
    ],
    skillEvolution: [
      { param: "planning.intensity", from: 0.8, to: 0.6 },
      { param: "planning.taskGranularity", from: "normal", to: "small" }
    ]
  }
};

export type MockDataType = typeof mockData;