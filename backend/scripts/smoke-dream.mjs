const dreamResponse = await fetch("http://127.0.0.1:4399/api/lifeos/dream", {
  method: "POST"
});

if (!dreamResponse.ok) {
  throw new Error(`Dream smoke failed: ${dreamResponse.status} ${await dreamResponse.text()}`);
}

const result = await dreamResponse.json();

if (!Array.isArray(result.dream.traceSteps) || result.dream.traceSteps.length < 4) {
  throw new Error("Dream smoke failed: missing traceSteps evidence");
}

if (!result.dream.stateDiff?.memory || !result.dream.stateDiff?.skills) {
  throw new Error("Dream smoke failed: missing stateDiff evidence");
}

console.log(JSON.stringify({
  dreamId: result.dream.dreamId,
  summary: result.dream.summary,
  observations: result.dream.observations,
  memoryProposals: result.dream.memoryProposals,
  skillProposals: result.dream.skillProposals,
  traceStepCount: result.dream.traceSteps.length,
  traceStepIds: result.dream.traceSteps.map((step) => step.id),
  stateDiff: result.dream.stateDiff,
  totalLatencyMs: result.dream.totalLatencyMs,
  fileCount: result.memoryFiles.length,
  sampleFiles: result.memoryFiles.slice(0, 8).map((file) => file.path)
}, null, 2));
