const response = await fetch("http://127.0.0.1:4399/api/lifeos/demo", {
  method: "POST"
});

if (!response.ok) {
  throw new Error(`Demo smoke failed: ${response.status} ${await response.text()}`);
}

const result = await response.json();

console.log(JSON.stringify({
  traceId: result.run.harnessTrace.traceId,
  feedbackId: result.feedback.feedback.feedbackId,
  dreamId: result.dream.dreamId,
  totalProgress: result.state.profile.totalProgress,
  traces: result.state.traces.length,
  dreams: result.state.dreams.length,
  feedbacks: result.state.feedbacks.length,
  memoryFiles: result.memoryFiles.length
}, null, 2));
