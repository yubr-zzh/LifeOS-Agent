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
  cultivatorName: '玄灵子',
  currentRealm: '练气六层',
  totalProgress: 56,

  subRealms: [
    { name: 'AI Agent 技术栈', level: '练气八层', progress: 72, color: '#5eead4' },
    { name: '算法能力', level: '练气四层', progress: 35, color: '#a78bfa' },
    { name: '项目实战', level: '练气七层', progress: 61, color: '#fbbf24' },
    { name: '英语表达', level: '练气二层', progress: 18, color: '#60a5fa' },
    { name: '作息与健康', level: '练气三层', progress: 31, color: '#fb7185' },
  ] as SubRealm[],

  todayTasks: [
    { id: 1, title: '完成 RAG 检索链路梳理', completed: true },
    { id: 2, title: '把 Harness trace 做成可演示证据', completed: false },
    { id: 3, title: '整理 LifeOS 路演脚本', completed: false },
    { id: 4, title: '复盘今天的心魔与节奏', completed: true },
  ],

  heartDemons: [
    { name: '下午分心', intensity: 85 },
    { name: '目标过大', intensity: 62 },
    { name: '焦虑感上升', intensity: 74 },
  ] as HeartDemon[],

  recentBreakthroughs: [
    '完成 Agent Harness 闭环',
    'Dreaming 机制写入文件式记忆',
    '反馈驱动 Skill 二次进化',
  ],

  journalInputExample:
    '今天学了 RAG，但是下午刷短视频浪费了两小时。算法题没做完，有点焦虑。晚上看了一点 Agent Harness 的资料，感觉 LifeOS 项目思路清楚了一些。',

  parsedJournal: {
    achievements: [
      'RAG 学习推进约 40%',
      'Agent Harness 资料阅读完成 1 次',
      'LifeOS 项目整体思路更清晰',
    ],
    heartDemons: ['下午分心', '目标过大', '焦虑感上升'],
    emotion: '轻度焦虑，但晚间状态有所回升',
    projectProgress: 'LifeOS Agent 工程方向继续推进',
    tomorrowPlan: [
      '上午：RAG / Harness 深度学习 90 分钟',
      '下午：整理笔记与接口，不安排高压任务',
      '晚上：算法 1 题 + 复盘 15 分钟',
    ],
    skillsUsed: [
      '每日复盘诀 (daily_reflection)',
      '心魔照见法 (obstacle_detection)',
      '周天规划术 (planning)',
      '记忆凝练术 (memory_consolidation)',
    ],
    memoryUpdates: [
      '新增：用户下午容易分心，适合安排低认知整理任务',
      '更新：用户当前主线目标为完成 LifeOS Agent MVP',
    ],
  },

  timeline: [
    {
      id: 1,
      date: '2026-06-20',
      title: 'LifeOS Agent 立项',
      type: 'record',
      description: '确定以伴随式成长 Agent 与修仙隐喻作为核心产品方向。',
    },
    {
      id: 2,
      date: '2026-06-22',
      title: '心魔暴露：拖延与目标过大',
      type: 'heart_demon',
      description: '连续两天任务拆解不足，触发计划粒度调整。',
    },
    {
      id: 3,
      date: '2026-06-24',
      title: '突破：完成核心 PRD',
      type: 'breakthrough',
      description: '梳理 Memory / Skills / Harness / Self-evolution 四层结构。',
    },
    {
      id: 4,
      date: '2026-06-28',
      title: '工程闭环接通',
      type: 'breakthrough',
      description: '后端可生成 trace、feedback、dreaming 与文件式记忆。',
    },
  ] as TimelineNode[],

  radarData: {
    dimensions: ['技术深度', '项目推进', '学习稳定', '心魔控制', '规划能力'],
    values: [78, 68, 72, 54, 76],
  },

  harnessTrace: {
    traceId: 'trace_demo',
    timestamp: new Date().toISOString(),
    input:
      '今天学了 RAG，但是下午刷短视频浪费了两小时。算法题没做完，有点焦虑。晚上看了一点 Agent Harness 的资料，感觉 LifeOS 项目思路清楚了一些。',
    retrievedMemory: [
      {
        content: '用户最近多次在下午学习效率较低，适合安排整理类任务。',
        type: 'long_term_pattern' as const,
        confidence: 0.78,
        lastUpdated: '2026-06-26',
      },
      {
        content: '用户当前主线目标是完成 LifeOS Agent MVP。',
        type: 'long_term' as const,
        confidence: 0.95,
        lastUpdated: '2026-06-24',
      },
    ],
    selectedSkills: [
      { name: '每日复盘诀', skillId: 'daily_reflection', trigger: '用户提交每日记录', score: 0.82 },
      { name: '心魔照见法', skillId: 'obstacle_detection', trigger: '检测到分心与焦虑模式', score: 0.76 },
      { name: '周天规划术', skillId: 'planning', trigger: '需要生成明日计划', score: 0.88 },
      { name: '记忆凝练术', skillId: 'memory_consolidation', trigger: '记录包含新模式', score: 0.79 },
    ],
    agentOutput: {
      reflection: '本次修炼围绕 RAG、Agent Harness 与 LifeOS 项目推进展开。',
      nextPlan: ['上午推进核心学习', '下午整理文档接口', '晚上轻量算法复盘'],
    },
    evaluation: {
      planDifficulty: 0.72,
      emotionalSupport: 0.81,
      goalAlignment: 0.88,
      memoryGrounding: 0.69,
    },
    memoryUpdates: [
      '新增：下午容易分心，适合低认知任务',
      '更新：planning.intensity 建议降低到 0.6',
    ],
    skillEvolution: [
      { param: 'planning.intensity', from: 0.8, to: 0.6 },
      { param: 'planning.taskGranularity', from: 'normal', to: 'small' },
    ],
    parsedSignals: {
      topics: ['RAG', 'Agent Harness', 'LifeOS'],
      heartDemons: ['下午分心', '目标过大', '焦虑感上升'],
      tokens: ['rag', 'agent', 'harness', 'lifeos'],
    },
    modelCalls: [],
  },
};

export type MockDataType = typeof mockData;
