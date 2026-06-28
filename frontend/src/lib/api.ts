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
