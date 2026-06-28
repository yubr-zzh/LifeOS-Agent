import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Database,
  FileText,
  Gauge,
  GitCompareArrows,
  Loader2,
  MoonStar,
  Play,
  RefreshCw,
  ServerCog,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { mockData } from '../../lib/mockData';
import {
  getLatestHarnessTrace,
  getMemoryFiles,
  getRuntimeConfig,
  runDemoMode,
  runDreaming,
  type DreamReport,
  type HarnessTrace,
  type MemoryFile,
  type RuntimeConfig,
} from '../../lib/api';

const fallbackTrace = mockData.harnessTrace as unknown as HarnessTrace;

const HarnessPage = () => {
  const [trace, setTrace] = useState<HarnessTrace>(fallbackTrace);
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig | null>(null);
  const [dream, setDream] = useState<DreamReport | null>(null);
  const [memoryFiles, setMemoryFiles] = useState<MemoryFile[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [isDreaming, setIsDreaming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const cachedRun = localStorage.getItem('lifeos:lastRun');
    if (cachedRun) {
      try {
        const parsed = JSON.parse(cachedRun);
        if (parsed.harnessTrace) setTrace(parsed.harnessTrace);
      } catch (error) {
        console.warn('Failed to read cached LifeOS trace', error);
      }
    }

    getLatestHarnessTrace()
      .then((result) => {
        if (result.trace) setTrace(result.trace);
      })
      .catch((error) => console.warn('LifeOS trace unavailable, using fallback', error));

    getMemoryFiles()
      .then((result) => setMemoryFiles(result.files ?? []))
      .catch((error) => console.warn('LifeOS memory vault unavailable', error));

    getRuntimeConfig()
      .then(setRuntimeConfig)
      .catch((error) => console.warn('LifeOS runtime config unavailable', error));
  }, []);

  const flowSteps = useMemo(
    () => [
      {
        title: 'Daily Input',
        detail: trace.input,
        icon: FileText,
        tone: 'teal',
      },
      {
        title: 'Memory Retrieval',
        detail: `${trace.retrievedMemory.length} 条长期记忆参与推理`,
        icon: Database,
        tone: 'amber',
      },
      {
        title: 'Skill Selection',
        detail: trace.selectedSkills.map((skill) => skill.name).join(' / '),
        icon: WandSparkles,
        tone: 'indigo',
      },
      {
        title: 'Reflection Generation',
        detail: trace.agentOutput?.reflection ?? '生成复盘与下一轮计划',
        icon: BrainCircuit,
        tone: 'teal',
      },
      {
        title: 'Harness Evaluation',
        detail: Object.entries(trace.evaluation).map(([key, value]) => `${key}: ${value}`).join(' · '),
        icon: Gauge,
        tone: 'rose',
      },
      {
        title: 'Evolution',
        detail: trace.skillEvolution.map((item) => `${item.param}: ${item.from} → ${item.to}`).join(' · '),
        icon: GitCompareArrows,
        tone: 'amber',
      },
    ],
    [trace],
  );

  const replayHarness = () => {
    setIsReplaying(true);
    setActiveStep(0);
    let index = 0;
    const interval = setInterval(() => {
      if (index < flowSteps.length) {
        setActiveStep(index);
        index += 1;
      } else {
        clearInterval(interval);
        setIsReplaying(false);
      }
    }, 520);
  };

  const handleDemoMode = async () => {
    setIsDemoRunning(true);
    setStatus(null);
    try {
      const result = await runDemoMode();
      setTrace(result.run.harnessTrace as HarnessTrace);
      setDream(result.dream);
      setMemoryFiles(result.memoryFiles);
      localStorage.setItem('lifeos:lastRun', JSON.stringify(result.run));
      setStatus(`Demo 闭环完成：${result.run.harnessTrace.traceId}`);
      replayHarness();
    } catch (error) {
      console.warn('Demo mode failed', error);
      setStatus('Demo 后端暂不可用，当前展示 fallback trace。');
    } finally {
      setIsDemoRunning(false);
    }
  };

  const handleDreaming = async () => {
    setIsDreaming(true);
    setStatus(null);
    try {
      const result = await runDreaming();
      setDream(result.dream);
      setMemoryFiles(result.memoryFiles);
      setStatus(`Dreaming 已完成：${result.dream.dreamId}`);
    } catch (error) {
      console.warn('Dreaming failed', error);
      setStatus('Dreaming 调用失败，请确认后端已启动。');
    } finally {
      setIsDreaming(false);
    }
  };

  const modelCall = trace.modelCalls?.[0] ?? dream?.modelCalls?.[0];

  return (
    <div className="h-screen overflow-auto p-8 pr-10 custom-scroll">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-teal-100/75">
            <ServerCog size={14} />
            Agent Harness
          </div>
          <h1 className="text-5xl font-black tracking-[-0.045em] text-white">工程证据面板</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/45">
            展示 LifeOS 不是普通日记应用，而是一个可观测、可反馈、可沉淀记忆、可自进化的 Agent Harness。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDemoMode}
            disabled={isDemoRunning}
            className="flex items-center gap-2 rounded-2xl bg-teal-200 px-5 py-4 font-bold text-black transition hover:bg-teal-100 disabled:opacity-60"
          >
            {isDemoRunning ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
            一键演示闭环
          </button>
          <button
            onClick={replayHarness}
            disabled={isReplaying}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-4 text-white/74 transition hover:border-teal-200/25 hover:text-white disabled:opacity-60"
          >
            <RefreshCw className={isReplaying ? 'animate-spin' : ''} size={18} />
            回放 Trace
          </button>
        </div>
      </div>

      {status && <div className="mb-5 rounded-2xl border border-teal-200/18 bg-teal-200/8 px-5 py-4 text-sm text-teal-50/78">{status}</div>}

      <div className="mb-5 grid grid-cols-4 gap-4">
        <RuntimeCard
          title="LLM Node"
          value={runtimeConfig?.llm.enabled ? 'DeepSeek 在线' : '规则 fallback'}
          detail={runtimeConfig?.llm.model ?? 'waiting backend'}
          icon={BrainCircuit}
        />
        <RuntimeCard
          title="Vision Node"
          value={runtimeConfig?.vision.hasApiKey ? '豆包视觉已配置' : '待接入'}
          detail={runtimeConfig?.vision.endpointId || 'multimodal memory next'}
          icon={Sparkles}
        />
        <RuntimeCard
          title="Model Call"
          value={modelCall ? `${modelCall.status}` : 'none'}
          detail={modelCall ? `${modelCall.purpose} / ${modelCall.latencyMs}ms` : '等待下一次运行'}
          icon={ServerCog}
        />
        <RuntimeCard
          title="Trace"
          value={trace.traceId}
          detail={new Date(trace.timestamp).toLocaleString()}
          icon={GitCompareArrows}
        />
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-sm font-semibold text-white/78">执行链路</div>
            <span className="rounded-full border border-white/10 bg-black/24 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">daily input → evolution</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {flowSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index || (!isReplaying && index <= activeStep);
              return (
                <motion.div
                  key={step.title}
                  animate={{ opacity: isActive ? 1 : 0.42, scale: isActive ? 1 : 0.985 }}
                  className={`min-h-[150px] rounded-[1.4rem] border p-5 transition ${
                    isActive ? 'border-teal-200/22 bg-teal-200/[0.06]' : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/24">
                      <Icon size={18} className="text-teal-100" />
                    </div>
                    <span className="font-mono text-[10px] text-white/35">STEP {String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="text-lg font-bold tracking-[-0.02em] text-white">{step.title}</div>
                  <div className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/52">{step.detail}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-4">
          <div className="mb-5 text-sm font-semibold text-white/78">评估指标</div>
          <div className="space-y-4">
            {Object.entries(trace.evaluation).map(([key, value]) => (
              <div key={key}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-white/62">{key}</span>
                  <span className="font-mono text-teal-100">{Math.round(Number(value) * 100)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-200 to-amber-200" style={{ width: `${Number(value) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-[1.4rem] border border-amber-200/15 bg-amber-200/[0.055] p-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-100/70">
              <MoonStar size={15} />
              Dreaming Engine
            </div>
            <p className="text-sm leading-relaxed text-white/55">{dream?.summary ?? '离线反思会读取近期 traces，沉淀长期记忆、Skill 调参建议和下一轮实验。'}</p>
            <button
              onClick={handleDreaming}
              disabled={isDreaming}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200/20 bg-black/22 px-4 py-3 text-sm text-amber-50/78 transition hover:bg-amber-200/10 disabled:opacity-60"
            >
              {isDreaming ? <Loader2 className="animate-spin" size={16} /> : <MoonStar size={16} />}
              运行 Dreaming
            </button>
          </div>
        </section>

        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/78">
            <Database size={18} className="text-amber-200" />
            Retrieved Memory
          </div>
          <div className="space-y-3">
            {trace.retrievedMemory.map((memory, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-black/22 p-4">
                <div className="mb-2 flex justify-between gap-3">
                  <span className="rounded-full bg-white/8 px-2 py-1 font-mono text-[10px] text-white/38">{memory.type}</span>
                  <span className="font-mono text-xs text-teal-100">{Math.round(memory.confidence * 100)}%</span>
                </div>
                <div className="text-sm leading-relaxed text-white/62">{memory.content}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/78">
            <WandSparkles size={18} className="text-teal-200" />
            Selected Skills
          </div>
          <div className="space-y-3">
            {trace.selectedSkills.map((skill) => (
              <div key={skill.skillId} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white/84">{skill.name}</div>
                    <div className="mt-1 font-mono text-[10px] text-white/35">{skill.skillId}</div>
                  </div>
                  <div className="font-mono text-sm text-teal-100">{skill.score}</div>
                </div>
                <div className="mt-3 text-xs leading-relaxed text-white/42">{skill.trigger}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/78">
            <FileText size={18} className="text-indigo-200" />
            File-system Memory
          </div>
          <div className="max-h-[320px] space-y-2 overflow-auto pr-1 custom-scroll">
            {memoryFiles.length ? (
              memoryFiles.slice(0, 10).map((file) => (
                <div key={file.path} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="truncate font-mono text-xs text-indigo-100/78">{file.path}</div>
                  <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/38">{file.content.replace(/---[\s\S]*?---/, '').trim().slice(0, 120)}</div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/35">启动后端后会自动生成 memory vault。</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const RuntimeCard = ({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof BrainCircuit;
}) => (
  <div className="glass-panel rounded-[1.4rem] p-5">
    <div className="mb-4 flex items-center justify-between">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{title}</div>
      <Icon size={17} className="text-teal-100/72" />
    </div>
    <div className="truncate text-lg font-bold tracking-[-0.02em] text-white">{value}</div>
    <div className="mt-1 truncate text-xs text-white/38">{detail}</div>
  </div>
);

export default HarnessPage;
