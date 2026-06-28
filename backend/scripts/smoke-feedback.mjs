const latestResponse = await fetch("http://127.0.0.1:4399/api/lifeos/traces/latest");
if (!latestResponse.ok) {
  throw new Error(`Latest trace failed: ${latestResponse.status} ${await latestResponse.text()}`);
}

const latest = await latestResponse.json();
if (!latest.trace?.traceId) {
  throw new Error("No latest trace. Run backend:smoke first.");
}

const feedbackResponse = await fetch("http://127.0.0.1:4399/api/lifeos/feedback", {
  method: "POST",
  headers: {
    "content-type": "application/json; charset=utf-8"
  },
  body: JSON.stringify({
    traceId: latest.trace.traceId,
    rating: "too_hard",
    planFit: "too_heavy",
    adopted: "partially",
    note: "计划方向有用，但任务粒度还是偏大，明天更适合微任务。"
  })
});

if (!feedbackResponse.ok) {
  throw new Error(`Feedback smoke failed: ${feedbackResponse.status} ${await feedbackResponse.text()}`);
}

const result = await feedbackResponse.json();

console.log(JSON.stringify({
  feedbackId: result.feedback.feedbackId,
  traceId: result.feedback.traceId,
  rating: result.feedback.rating,
  skillEvolution: result.skillEvolution,
  fileCount: result.memoryFiles.length,
  sampleFeedbackFile: result.memoryFiles.find((file) => file.path.startsWith("feedbacks/"))?.path
}, null, 2));
