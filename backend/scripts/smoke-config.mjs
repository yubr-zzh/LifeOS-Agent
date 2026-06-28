const response = await fetch("http://127.0.0.1:4399/api/lifeos/config");
if (!response.ok) throw new Error(`Config smoke failed: ${response.status} ${await response.text()}`);

const config = await response.json();
console.log(JSON.stringify({
  llm: {
    enabled: config.llm.enabled,
    provider: config.llm.provider,
    model: config.llm.model,
    hasApiKey: config.llm.hasApiKey
  },
  vision: {
    provider: config.vision.provider,
    endpointIdSet: Boolean(config.vision.endpointId),
    hasApiKey: config.vision.hasApiKey
  }
}, null, 2));
