const dreamResponse = await fetch("http://127.0.0.1:4399/api/lifeos/dream", {
  method: "POST"
});

if (!dreamResponse.ok) {
  throw new Error(`Dream smoke failed: ${dreamResponse.status} ${await dreamResponse.text()}`);
}

const result = await dreamResponse.json();

console.log(JSON.stringify({
  dreamId: result.dream.dreamId,
  summary: result.dream.summary,
  observations: result.dream.observations,
  memoryProposals: result.dream.memoryProposals,
  skillProposals: result.dream.skillProposals,
  fileCount: result.memoryFiles.length,
  sampleFiles: result.memoryFiles.slice(0, 8).map((file) => file.path)
}, null, 2));
