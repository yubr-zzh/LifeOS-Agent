import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  CheckCircle2,
  Clock3,
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
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { mockData } from '../../lib/mockData';
import {
  getLatestHarnessTrace,
  getMemoryFiles,
  getRuntimeConfig,
  runDemoMode,
  runDreaming,
  type DreamReport,
  type HarnessStateDiff,
  type HarnessTrace,
  type MemoryFile,
  type RuntimeConfig,
  type TraceStep,
} from '../../lib/api';

const fallbackTrace = mockData.harnessTrace as unknown as HarnessTrace;

const stepIconMap: Record<string, LucideIcon> = {
  parser: FileText,
  memory: Database,
  skill: WandSparkles,
  llm_or_rule: BrainCircuit,
  evaluator: Gauge,
  profile: Sparkles,
  persistence: GitCompareArrows,
};

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

  const evidenceSteps = useMemo(() => {
    if (trace.traceSteps?.length) return trace.traceSteps;
    return buildFallbackSteps(trace);
  }, [trace]);

  const replayHarness = () => {
    setIsReplaying(true);
    setActiveStep(0);
    let index = 0;
    const interval = setInterval(() => {
      if (index < evidenceSteps.length) {
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
  const stateDiff = trace.stateDiff;

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
            每一次 LifeOS run 都被拆成可观测节点：输入摘要、输出摘要、耗时、状态和 state diff 都能回放。
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
        <RuntimeCard title="LLM Node" value={runtimeConfig?.llm.enabled ? 'DeepSeek 在线' : '规则 fallback'} detail={runtimeConfig?.llm.model ?? 'waiting backend'} icon={BrainCircuit} />
        <RuntimeCard title="Vision Node" value={runtimeConfig?.vision.hasApiKey ? '豆包视觉已配置' : '待接入'} detail={runtimeConfig?.vision.endpointId || 'multimodal memory next'} icon={Sparkles} />
        <RuntimeCard title="Trace Steps" value={`${evidenceSteps.length} steps`} detail={`${trace.totalLatencyMs ?? 0}ms total`} icon={Clock3} />
        <RuntimeCard title="Model Call" value={modelCall ? modelCall.status : 'none'} detail={modelCall ? `${modelCall.purpose} / ${modelCall.latencyMs}ms` : '等待下一次运行'} icon={ServerCog} />
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white/78">Agent Run Pipeline</div>
              <div className="mt-1 font-mono text-[10px] text-white/35">{trace.traceId}</div>
            </div>
            <span className="rounded-full border border-white/10 bg-black/24 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
              daily input → persistence
            </span>
          </div>

          <div className="space-y-3">
            {evidenceSteps.map((step, index) => (
              <TraceStepRow
                key={`${step.id}-${index}`}
                step={step}
                index={index}
                active={activeStep === index || (!isReplaying && index <= activeStep)}
              />
            ))}
          </div>
        </section>

        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-4">
          <div className="mb-5 text-sm font-semibold text-white/78">State Diff</div>
          <StateDiffPanel diff={stateDiff} />

          <div className="mt-6 rounded-[1.4rem] border border-amber-200/15 bg-amber-200/[0.055] p-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-100/70">
              <MoonStar size={15} />
              Dreaming Engine
            </div>
            <p className="text-sm leading-relaxed text-white/55">
              {dream?.summary ?? '离线反思会读取近期 traces，沉淀长期记忆、Skill 调参建议和下一轮实验。'}
            </p>
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

const TraceStepRow = ({ step, index, active }: { step: TraceStep; index: number; active: boolean }) => {
  const Icon = stepIconMap[step.type] ?? ServerCog;
  const ok = step.status === 'ok';

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.45, scale: active ? 1 : 0.992 }}
      className={`rounded-[1.25rem] border p-4 transition ${
        active ? 'border-teal-200/22 bg-teal-200/[0.055]' : 'border-white/10 bg-white/[0.025]'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/24">
          <Icon size={18} className="text-teal-100" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-white/35">STEP {String(index + 1).padStart(2, '0')}</span>
                <span className="truncate text-base font-bold tracking-[-0.02em] text-white">{step.title}</span>
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/28">{step.id} / {step.type}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full border border-white/10 bg-black/22 px-2.5 py-1 font-mono text-[10px] text-white/50">{step.latencyMs}ms</span>
              {ok ? <CheckCircle2 size={18} className="text-teal-200" /> : <XCircle size={18} className="text-rose-300" />}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <TraceSummary title="Input" value={step.inputSummary} />
            <TraceSummary title="Output" value={step.error || step.outputSummary} danger={!ok} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TraceSummary = ({ title, value, danger = false }: { title: string; value: string; danger?: boolean }) => (
  <div className={`min-h-[74px] rounded-xl border px-3 py-2 ${danger ? 'border-rose-300/20 bg-rose-300/8' : 'border-white/10 bg-black/18'}`}>
    <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">{title}</div>
    <div className="line-clamp-3 text-xs leading-relaxed text-white/52">{value || 'empty'}</div>
  </div>
);

const StateDiffPanel = ({ diff }: { diff?: HarnessStateDiff }) => {
  if (!diff) {
    return <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/35">下一次真实 run 后会显示 state diff。</div>;
  }

  const totalDelta = diff.profile?.totalProgress?.delta ?? 0;
  const subRealmChanges = diff.profile?.subRealms ?? [];
  const skillEvolution = diff.skills?.evolution ?? [];

  return (
    <div className="space-y-3">
      <DiffCard
        label="Memory"
        value={`${diff.memory?.beforeCount ?? 0} → ${diff.memory?.afterCount ?? 0}`}
        detail={`added ${diff.memory?.added?.length ?? 0}, updated ${diff.memory?.updated?.length ?? 0}`}
      />
      <DiffCard
        label="Profile"
        value={`${totalDelta >= 0 ? '+' : ''}${totalDelta}%`}
        detail={subRealmChanges.length ? subRealmChanges.map((item) => `${item.name} ${item.delta >= 0 ? '+' : ''}${item.delta}`).join(' / ') : 'no sub-realm delta'}
      />
      <DiffCard
        label="Skills"
        value={`${skillEvolution.length} changes`}
        detail={skillEvolution.map((item) => `${item.param}: ${item.from} → ${item.to}`).join(' / ') || 'stable'}
      />
    </div>
  );
};

const DiffCard = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</div>
    <div className="text-xl font-black tracking-[-0.03em] text-white">{value}</div>
    <div className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/45">{detail}</div>
  </div>
);

const RuntimeCard = ({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
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

function buildFallbackSteps(trace: HarnessTrace): TraceStep[] {
  return [
    {
      id: 'fallback_input',
      title: 'Fallback daily input',
      type: 'parser',
      status: 'ok',
      startedAt: trace.timestamp,
      latencyMs: 0,
      inputSummary: trace.input,
      outputSummary: 'Using mock trace because no backend traceSteps are available.',
    },
  ];
}

export default HarnessPage;
