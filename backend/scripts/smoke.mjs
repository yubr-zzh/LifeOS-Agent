const input = "今天学了 RAG，但是下午刷短视频浪费了两小时。算法题没做完，有点焦虑。晚上看了一点 Agent Harness 的资料，感觉 LifeOS 项目思路清楚了一些。";

const response = await fetch("http://127.0.0.1:4399/api/lifeos/run", {
  method: "POST",
  headers: {
    "content-type": "application/json; charset=utf-8"
  },
  body: JSON.stringify({ input })
});

if (!response.ok) {
  throw new Error(`Smoke failed: ${response.status} ${await response.text()}`);
}

const result = await response.json();

console.log(JSON.stringify({
  traceId: result.harnessTrace.traceId,
  achievements: result.parsedJournal.achievements,
  heartDemons: result.parsedJournal.heartDemons,
  selectedSkills: result.harnessTrace.selectedSkills.map((skill) => skill.skillId),
  memoryUpdates: result.harnessTrace.memoryUpdates,
  skillEvolution: result.harnessTrace.skillEvolution
}, null, 2));
