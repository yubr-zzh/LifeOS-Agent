import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrainCircuit,
  CheckCircle2,
  Database,
  FileText,
  GitCompareArrows,
  Loader2,
  MessageSquareHeart,
  MoonStar,
  Play,
  ServerCog,
  Sparkles,
  WandSparkles,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { mockData } from '../../lib/mockData';
import {
  getLifeOSState,
  getMemoryFiles,
  getRuntimeConfig,
  runDemoMode,
  runDreaming,
  type DreamReport,
  type HarnessStateDiff,
  type HarnessTrace,
  type LifeOSState,
  type MemoryFile,
  type RuntimeConfig,
  type TraceStep,
} from '../../lib/api';

const fallbackTrace = mockData.harnessTrace as unknown as HarnessTrace;
type FeedbackEvidence = LifeOSState['feedbacks'][number];
type EvidenceView = 'run' | 'feedback' | 'dream';

const stepIconMap: Record<string, LucideIcon> = {
  parser: FileText,
  memory: Database,
  skill: WandSparkles,
  llm_or_rule: BrainCircuit,
  evaluator: ServerCog,
  profile: Sparkles,
  persistence: GitCompareArrows,
  dreaming: MoonStar,
  trace: GitCompareArrows,
  evaluation: MessageSquareHeart,
  filesystem: Database,
  model: BrainCircuit,
};

const HarnessPage = () => {
  const [trace, setTrace] = useState<HarnessTrace>(fallbackTrace);
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig | null>(null);
  const [dream, setDream] = useState<DreamReport | null>(null);
  const [feedbackEvidence, setFeedbackEvidence] = useState<FeedbackEvidence | null>(null);
  const [memoryFiles, setMemoryFiles] = useState<MemoryFile[]>([]);
  const [evidenceView, setEvidenceView] = useState<EvidenceView>('run');
  const [showEvidence, setShowEvidence] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [isDreaming, setIsDreaming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    getLifeOSState()
      .then((state) => {
        if (state.latestTrace) setTrace(state.latestTrace);
        setDream(state.dreams.at(-1) ?? null);
        setFeedbackEvidence(state.feedbacks.at(-1) ?? null);
      })
      .catch((error) => console.warn('LifeOS state unavailable, using fallback harness data', error));

    getMemoryFiles()
      .then((result) => setMemoryFiles(result.files ?? []))
      .catch((error) => console.warn('LifeOS memory vault unavailable', error));

    getRuntimeConfig()
      .then(setRuntimeConfig)
      .catch((error) => console.warn('LifeOS runtime config unavailable', error));
  }, []);

  const runSteps = trace.traceSteps?.length ? trace.traceSteps : buildFallbackSteps(trace);

  const selectedEvidence = useMemo(() => {
    if (evidenceView === 'dream') {
      return {
        title: 'Dreaming 证据链',
        subtitle: dream?.dreamId ?? '等待 Dreaming',
        steps: dream?.traceSteps ?? [],
        diff: dream?.stateDiff,
        latency: dream?.totalLatencyMs,
      };
    }

    if (evidenceView === 'feedback') {
      return {
        title: '反馈进化证据链',
        subtitle: feedbackEvidence?.feedbackId ?? '等待用户反馈',
        steps: feedbackEvidence?.traceSteps ?? [],
        diff: feedbackEvidence?.stateDiff,
        latency: feedbackEvidence?.totalLatencyMs,
      };
    }

    return {
      title: '主运行证据链',
      subtitle: trace.traceId,
      steps: runSteps,
      diff: trace.stateDiff,
      latency: trace.totalLatencyMs,
    };
  }, [dream, evidenceView, feedbackEvidence, runSteps, trace]);

  const selectedSteps = selectedEvidence.steps.length ? selectedEvidence.steps : buildEmptyEvidenceStep(selectedEvidence.title);
  const modelCall = trace.modelCalls?.[0] ?? dream?.modelCalls?.[0];

  const handleDemoMode = async () => {
    setIsDemoRunning(true);
    setStatus(null);
    try {
      const result = await runDemoMode();
      setTrace(result.run.harnessTrace as HarnessTrace);
      setDream(result.dream);
      setFeedbackEvidence(result.feedback.feedback);
      setMemoryFiles(result.memoryFiles);
      localStorage.setItem('lifeos:lastRun', JSON.stringify(result.run));
      setStatus(`LifeOS 闭环完成：${result.run.harnessTrace.traceId}`);
    } catch (error) {
      console.warn('Demo mode failed', error);
      setStatus('Demo 调用失败，请确认后端已启动。');
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
      setEvidenceView('dream');
      setShowEvidence(true);
      setStatus(`Dreaming 已完成：${result.dream.dreamId}`);
    } catch (error) {
      console.warn('Dreaming failed', error);
      setStatus('Dreaming 调用失败，请确认后端已启动。');
    } finally {
      setIsDreaming(false);
    }
  };

  return (
    <div className="h-screen overflow-auto p-8 pr-10 custom-scroll">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-teal-100/75">
          <ServerCog size={14} />
          Agent Runtime
        </div>
        <div className="flex items-end justify-between gap-8">
          <div>
            <h1 className="text-5xl font-black tracking-[-0.045em] text-white">LifeOS 内核舱</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/45">
              这里不是调试台，而是你的伴随式 Agent 中枢。它把日常输入转化为记忆、技能选择、反馈进化与 Dreaming 沉淀。
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
              onClick={() => setShowEvidence((value) => !value)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-4 text-white/74 transition hover:border-teal-200/25 hover:text-white"
            >
              <GitCompareArrows size={18} />
              工程证据
            </button>
          </div>
        </div>
      </div>

      {status && <div className="mb-5 rounded-2xl border border-teal-200/18 bg-teal-200/8 px-5 py-4 text-sm text-teal-50/78">{status}</div>}

      <div className="grid grid-cols-12 gap-5">
        <section className="glass-panel relative col-span-12 min-h-[430px] overflow-hidden rounded-[2rem] p-7 lg:col-span-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(94,234,212,.22),transparent_26%),radial-gradient(circle_at_70%_75%,rgba(159,140,255,.14),transparent_32%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">LifeOS Core</div>
                <div className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">伴随式自进化智能体</div>
              </div>
              <RuntimePill online={Boolean(runtimeConfig?.llm.enabled)} />
            </div>

            <div className="grid place-items-center py-8">
              <motion.div
                className="relative grid h-56 w-56 place-items-center rounded-full border border-teal-200/30 bg-teal-200/10"
                animate={{ boxShadow: ['0 0 60px rgba(94,234,212,.28)', '0 0 110px rgba(159,140,255,.3)', '0 0 60px rgba(94,234,212,.28)'] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="absolute inset-8 rounded-full border border-dashed border-white/16" style={{ animation: 'slow-spin 32s linear infinite' }} />
                <div className="grid h-32 w-32 place-items-center rounded-full bg-black/70 text-center">
                  <div>
                    <div className="text-4xl font-black text-teal-100">OS</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Agent Core</div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Metric label="Trace" value={trace.traceId?.replace('trace_', '').slice(0, 10) || 'ready'} />
              <Metric label="Memory" value={`${memoryFiles.length || 0} files`} />
              <Metric label="Dreaming" value={dream ? 'active' : 'ready'} />
            </div>
          </div>
        </section>

        <section className="col-span-12 grid gap-4 lg:col-span-5">
          <CapabilityCard
            icon={Database}
            title="文件式系统内存"
            subtitle="把经验沉淀成可审查目录"
            value={`${memoryFiles.length || 0} files`}
          />
          <CapabilityCard
            icon={WandSparkles}
            title="技能选择与熟练度"
            subtitle="根据输入选择可执行 Skill"
            value={`${trace.selectedSkills?.length ?? 0} skills`}
          />
          <CapabilityCard
            icon={MessageSquareHeart}
            title="反馈驱动自进化"
            subtitle="用户反馈会改变策略参数"
            value={feedbackEvidence?.rating ?? 'waiting'}
          />
          <CapabilityCard
            icon={MoonStar}
            title="Dreaming 离线凝练"
            subtitle="压缩近期 traces 为长期模式"
            value={dream ? 'ready' : 'idle'}
            action={
              <button onClick={handleDreaming} disabled={isDreaming} className="rounded-xl border border-amber-200/20 bg-amber-200/[0.06] px-3 py-2 text-xs text-amber-50/78">
                {isDreaming ? '运行中' : '运行'}
              </button>
            }
          />
        </section>

        <section className="glass-panel col-span-12 rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white/80">今日闭环摘要</div>
              <div className="mt-1 text-xs text-white/38">产品视图展示结果；工程细节可以在证据区展开。</div>
            </div>
            <div className="flex gap-2 text-xs text-white/40">
              <span>LLM: {runtimeConfig?.llm.enabled ? runtimeConfig.llm.model : 'fallback'}</span>
              <span>/</span>
              <span>Model call: {modelCall?.status ?? 'none'}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {(trace.selectedSkills ?? []).slice(0, 4).map((skill) => (
              <div key={skill.skillId} className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-2 text-sm font-semibold text-white/82">{skill.name}</div>
                <div className="line-clamp-2 text-xs leading-relaxed text-white/42">{skill.trigger}</div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-teal-200" style={{ width: `${Math.min(skill.score * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <AnimatePresence>
          {showEvidence && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-panel col-span-12 rounded-[2rem] p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/80">工程证据抽屉</div>
                  <div className="mt-1 font-mono text-[10px] text-white/35">{selectedEvidence.subtitle}</div>
                </div>
                <EvidenceTabs active={evidenceView} onChange={setEvidenceView} runCount={runSteps.length} feedbackCount={feedbackEvidence?.traceSteps?.length ?? 0} dreamCount={dream?.traceSteps?.length ?? 0} />
              </div>

              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 space-y-3 lg:col-span-8">
                  {selectedSteps.map((step, index) => (
                    <TraceStepRow key={`${step.id}-${index}`} step={step} index={index} />
                  ))}
                </div>
                <div className="col-span-12 lg:col-span-4">
                  <StateDiffPanel diff={selectedEvidence.diff} latency={selectedEvidence.latency} title={selectedEvidence.title} />
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const RuntimePill = ({ online }: { online: boolean }) => (
  <div className="rounded-full border border-white/10 bg-black/28 px-4 py-2 text-xs text-white/55">
    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${online ? 'bg-emerald-300' : 'bg-amber-300'}`} />
    {online ? 'LLM online' : 'Rule fallback'}
  </div>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/32">{label}</div>
    <div className="mt-1 truncate text-sm text-white/76">{value}</div>
  </div>
);

const CapabilityCard = ({
  icon: Icon,
  title,
  subtitle,
  value,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  value: string;
  action?: React.ReactNode;
}) => (
  <div className="glass-panel rounded-[1.5rem] p-5">
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-teal-200/20 bg-teal-200/8">
          <Icon size={19} className="text-teal-100" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white/84">{title}</div>
          <div className="mt-1 truncate text-xs text-white/38">{subtitle}</div>
        </div>
      </div>
      {action ?? <span className="shrink-0 rounded-full bg-white/8 px-3 py-1 font-mono text-xs text-white/45">{value}</span>}
    </div>
  </div>
);

const EvidenceTabs = ({
  active,
  onChange,
  runCount,
  feedbackCount,
  dreamCount,
}: {
  active: EvidenceView;
  onChange: (view: EvidenceView) => void;
  runCount: number;
  feedbackCount: number;
  dreamCount: number;
}) => {
  const tabs: Array<[EvidenceView, string, number]> = [
    ['run', 'Agent Run', runCount],
    ['feedback', 'Feedback', feedbackCount],
    ['dream', 'Dreaming', dreamCount],
  ];

  return (
    <div className="flex gap-2">
      {tabs.map(([id, label, count]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`rounded-full border px-4 py-2 text-xs transition ${
            active === id ? 'border-teal-200/35 bg-teal-200/12 text-teal-50' : 'border-white/10 bg-white/[0.035] text-white/45 hover:text-white'
          }`}
        >
          {label} · {count}
        </button>
      ))}
    </div>
  );
};

const TraceStepRow = ({ step, index }: { step: TraceStep; index: number }) => {
  const Icon = stepIconMap[step.type] ?? ServerCog;
  const ok = step.status === 'ok';

  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.025] p-4">
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
    </div>
  );
};

const TraceSummary = ({ title, value, danger = false }: { title: string; value: string; danger?: boolean }) => (
  <div className={`min-h-[74px] rounded-xl border px-3 py-2 ${danger ? 'border-rose-300/20 bg-rose-300/8' : 'border-white/10 bg-black/18'}`}>
    <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">{title}</div>
    <div className="line-clamp-3 text-xs leading-relaxed text-white/52">{value || 'empty'}</div>
  </div>
);

const StateDiffPanel = ({ diff, latency, title }: { diff?: HarnessStateDiff; latency?: number; title: string }) => (
  <div className="space-y-3">
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">{title}</div>
      <div className="text-xl font-black tracking-[-0.03em] text-white">{latency ?? 0}ms</div>
      <div className="mt-2 text-xs leading-relaxed text-white/45">完整链路耗时</div>
    </div>
    {diff?.memory && <DiffCard label="Memory" value={`${diff.memory.beforeCount} -> ${diff.memory.afterCount}`} detail={`added ${diff.memory.added.length}, updated ${diff.memory.updated.length}`} />}
    {diff?.profile && <DiffCard label="Profile" value={`${diff.profile.totalProgress?.delta ?? 0}%`} detail={(diff.profile.subRealms ?? []).map((item) => `${item.name} ${item.delta}`).join(' / ') || 'stable'} />}
    {diff?.skills && <DiffCard label="Skills" value={`${diff.skills.evolution?.length ?? 0} changes`} detail={(diff.skills.evolution ?? []).map((item) => `${item.param}: ${item.from} -> ${item.to}`).join(' / ') || 'stable'} />}
  </div>
);

const DiffCard = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</div>
    <div className="text-xl font-black tracking-[-0.03em] text-white">{value}</div>
    <div className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/45">{detail}</div>
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

function buildEmptyEvidenceStep(title: string): TraceStep[] {
  return [
    {
      id: 'waiting_for_evidence',
      title: `Waiting for ${title}`,
      type: 'persistence',
      status: 'ok',
      startedAt: new Date().toISOString(),
      latencyMs: 0,
      inputSummary: 'Run demo mode, submit feedback, or trigger Dreaming to generate this evidence chain.',
      outputSummary: 'No traceSteps have been recorded for this view yet.',
    },
  ];
}

export default HarnessPage;
