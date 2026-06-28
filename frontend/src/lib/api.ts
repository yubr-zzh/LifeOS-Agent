const API_BASE = import.meta.env.VITE_LIFEOS_API_BASE ?? 'http://127.0.0.1:4399';

export interface LifeOSRunResponse {
  parsedJournal: {
    achievements: string[];
    heartDemons: string[];
    emotion: string;
    projectProgress: string;
    tomorrowPlan: string[];
    skillsUsed: string[];
    memoryUpdates: string[];
  };
  harnessTrace: {
    traceId: string;
    timestamp: string;
    input: string;
    retrievedMemory: Array<{
      content: string;
      type: string;
      confidence: number;
      lastUpdated: string;
    }>;
    selectedSkills: Array<{
      name: string;
      skillId: string;
      trigger: string;
      score: number;
    }>;
    agentOutput: {
      reflection: string;
      nextPlan: string[];
    };
    evaluation: Record<string, number>;
    memoryUpdates: string[];
    skillEvolution: Array<{
      param: string;
      from: string | number;
      to: string | number;
    }>;
  };
  profile: unknown;
  dailyLog: unknown;
}

export interface DreamReport {
  dreamId: string;
  timestamp: string;
  summary: string;
  observations: string[];
  memoryProposals: string[];
  skillProposals: string[];
  nextExperiments: string[];
  sourceTraceIds: string[];
  sourceLogIds: string[];
}

export interface MemoryFile {
  path: string;
  content: string;
}

export interface FeedbackResponse {
  feedback: {
    feedbackId: string;
    traceId: string;
    rating: string;
    planFit: string;
    adopted: string;
    note?: string;
  };
  updatedTrace: LifeOSRunResponse['harnessTrace'] & {
    userFeedback?: unknown;
    feedbackEvolution?: Array<{
      param: string;
      from: string | number;
      to: string | number;
    }>;
  };
  skillEvolution: Array<{
    param: string;
    from: string | number;
    to: string | number;
  }>;
  memoryFiles: MemoryFile[];
}

export async function runLifeOSAgent(input: string): Promise<LifeOSRunResponse> {
  const response = await fetch(`${API_BASE}/api/lifeos/run`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error(`LifeOS Agent backend returned ${response.status}`);
  }

  return response.json();
}

export async function getLatestHarnessTrace() {
  const response = await fetch(`${API_BASE}/api/lifeos/traces/latest`);
  if (!response.ok) {
    throw new Error(`LifeOS Agent backend returned ${response.status}`);
  }
  return response.json();
}

export async function runDreaming(): Promise<{ dream: DreamReport; memoryFiles: MemoryFile[] }> {
  const response = await fetch(`${API_BASE}/api/lifeos/dream`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`LifeOS Agent backend returned ${response.status}`);
  }

  return response.json();
}

export async function getMemoryFiles(): Promise<{ files: MemoryFile[] }> {
  const response = await fetch(`${API_BASE}/api/lifeos/memory-files`);
  if (!response.ok) {
    throw new Error(`LifeOS Agent backend returned ${response.status}`);
  }
  return response.json();
}

export async function submitFeedback(payload: {
  traceId?: string;
  rating: 'too_hard' | 'just_right' | 'helpful' | 'not_helpful';
  planFit?: string;
  adopted?: string;
  note?: string;
}): Promise<FeedbackResponse> {
  const response = await fetch(`${API_BASE}/api/lifeos/feedback`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`LifeOS Agent backend returned ${response.status}`);
  }

  return response.json();
}
