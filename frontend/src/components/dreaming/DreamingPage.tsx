import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, Database, GitBranch, Loader2, MoonStar, RefreshCw, Sparkles, WandSparkles, type LucideIcon } from 'lucide-react';
import { getLifeOSState, runDreaming, type DreamReport, type LifeOSState } from '../../lib/api';

const DreamingPage = () => {
  const [state, setState] = useState<LifeOSState | null>(null);
  const [dream, setDream] = useState<DreamReport | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState('后台 Dreaming 会自行读取近期 traces、logs 与 feedbacks，并决定沉淀哪些长期模式。');

  const refreshState = async () => {
    const nextState = await getLifeOSState();
    setState(nextState);
    setDream(nextState.dreams.at(-1) ?? null);
  };

  useEffect(() => {
    refreshState().catch((error) => {
      console.warn('Dreaming state unavailable', error);
      setStatus('暂未连接后端，当前展示 Dreaming 产品形态。');
    });
  }, []);

  const queue = useMemo(() => {
    const traces = state?.traces ?? [];
    const logs = state?.logs ?? [];
    const feedbacks = state?.feedbacks ?? [];
    return [
      { label: 'Harness traces', value: traces.length, hint: '回放 Agent 决策链路', icon: GitBranch },
      { label: 'Daily logs', value: logs.length, hint: '理解真实学习状态', icon: Database },
      { label: 'Feedbacks', value: feedbacks.length, hint: '校准计划适配度', icon: Sparkles },
    ];
  }, [state]);

  const sourceCount = (dream?.sourceTraceIds?.length ?? 0) + (dream?.sourceLogIds?.length ?? 0);
  const observations = dream?.observations?.length ? dream.observations : [
    '等待后台 Dreaming 收集足够运行材料后自动生成长期模式。',
    '系统会优先寻找重复心魔、计划失配、Skill 有效性和阶段性突破。',
  ];
  const memoryProposals = dream?.memoryProposals?.length ? dream.memoryProposals : ['尚无新记忆提案，等待下一次后台凝练。'];
  const skillProposals = dream?.skillProposals?.length ? dream.skillProposals : ['Skill 参数保持稳定，继续观察。'];
  const experiments = dream?.nextExperiments?.length ? dream.nextExperiments : ['下一轮实验将由系统根据近期 trace 自主生成。'];

  const handleSync = async () => {
    setIsSyncing(true);
    setStatus('正在请求后台 Dreaming 节点同步一次最新沉淀...');
    try {
      const result = await runDreaming();
      setDream(result.dream);
      await refreshState();
      setStatus(`Dreaming 已更新：${result.dream.dreamId}`);
    } catch (error) {
      console.warn('Dreaming sync failed', error);
      setStatus('Dreaming 同步失败，请确认后端已启动；后台机制本身不依赖用户输入内容。');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="h-screen overflow-auto p-8 pr-10 custom-scroll">
      <div className="mb-8 flex items-end justify-between gap-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/20 bg-indigo-200/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-indigo-100/75">
            <MoonStar size={14} />
            Autonomous Dreaming
          </div>
          <h1 className="text-5xl font-black tracking-[-0.045em] text-white">Dreaming 后台沉淀</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/45">
            Dreaming 不要求用户填写内容。它在后台读取近期运行证据，自动决定哪些模式值得沉淀为 Memory，哪些 Skill 参数需要进化。
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 rounded-2xl border border-indigo-200/20 bg-indigo-200/[0.08] px-5 py-4 text-sm font-semibold text-indigo-50/82 transition hover:border-indigo-200/40 hover:bg-indigo-200/[0.12] disabled:opacity-55"
        >
          {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          同步后台状态
        </button>
      </div>

      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-sm text-white/55">{status}</div>

      <div className="grid grid-cols-12 gap-5">
        <section className="glass-panel relative col-span-12 min-h-[430px] overflow-hidden rounded-[2rem] p-7 lg:col-span-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_35%,rgba(167,139,250,.24),transparent_30%),radial-gradient(circle_at_65%_70%,rgba(94,234,212,.16),transparent_34%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Dream Engine</div>
                <div className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">离线反思，不打扰用户</div>
              </div>
              <div className="rounded-full border border-teal-200/20 bg-teal-200/[0.08] px-4 py-2 text-xs text-teal-50/70">
                {dream ? 'Latest report ready' : 'Cold start observing'}
              </div>
            </div>

            <div className="grid place-items-center py-8">
              <div className="dream-orbit">
                <div className="dream-orbit-ring ring-a" />
                <div className="dream-orbit-ring ring-b" />
                <motion.div
                  className="dream-core"
                  animate={{ y: [0, -10, 0], boxShadow: ['0 0 60px rgba(167,139,250,.26)', '0 0 120px rgba(94,234,212,.24)', '0 0 60px rgba(167,139,250,.26)'] }}
                  transition={{ duration: 4.8, repeat: Infinity }}
                >
                  <MoonStar size={48} />
                </motion.div>
                {queue.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      className="dream-source"
                      style={{ rotate: `${index * 120 - 90}deg` }}
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 3.2 + index * 0.4, repeat: Infinity }}
                    >
                      <div style={{ rotate: `${90 - index * 120}deg` }}>
                        <Icon size={20} />
                        <span>{item.value}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {queue.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/32">{item.label}</div>
                  <div className="mt-2 text-2xl font-black text-white">{item.value}</div>
                  <div className="mt-1 text-xs text-white/42">{item.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="col-span-12 space-y-4 lg:col-span-5">
          <DreamMetric title="最近 Dream" value={dream?.dreamId?.replace('dream_', '').slice(0, 12) ?? 'waiting'} hint={dream?.timestamp ? new Date(dream.timestamp).toLocaleString() : '等待后台生成'} />
          <DreamMetric title="来源证据" value={`${sourceCount}`} hint="trace 与 log 共同决定沉淀内容" />
          <DreamMetric title="链路耗时" value={`${dream?.totalLatencyMs ?? 0}ms`} hint="Dreaming trace 可在 Harness 证据中回放" />
        </section>

        <DreamList title="系统观察" icon={BrainCircuit} items={observations} tone="cyan" />
        <DreamList title="Memory 沉淀提案" icon={Database} items={memoryProposals} tone="teal" />
        <DreamList title="Skill 进化提案" icon={WandSparkles} items={skillProposals} tone="violet" />
        <DreamList title="下一轮自主实验" icon={GitBranch} items={experiments} tone="gold" />
      </div>
    </div>
  );
};

const DreamMetric = ({ title, value, hint }: { title: string; value: string; hint: string }) => (
  <div className="glass-panel rounded-[1.5rem] p-5">
    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{title}</div>
    <div className="mt-3 truncate text-2xl font-black tracking-[-0.03em] text-white">{value}</div>
    <div className="mt-2 text-xs leading-relaxed text-white/42">{hint}</div>
  </div>
);

const DreamList = ({ title, icon: Icon, items, tone }: { title: string; icon: LucideIcon; items: string[]; tone: 'cyan' | 'teal' | 'violet' | 'gold' }) => {
  const toneClass = {
    cyan: 'border-cyan-200/18 bg-cyan-200/[0.04] text-cyan-100',
    teal: 'border-teal-200/18 bg-teal-200/[0.04] text-teal-100',
    violet: 'border-violet-200/18 bg-violet-200/[0.04] text-violet-100',
    gold: 'border-amber-200/18 bg-amber-200/[0.04] text-amber-100',
  }[tone];

  return (
    <section className="glass-panel col-span-12 rounded-[1.7rem] p-5 lg:col-span-6">
      <div className="mb-4 flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl border ${toneClass}`}>
          <Icon size={18} />
        </div>
        <div className="text-sm font-bold text-white/82">{title}</div>
      </div>
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={`${title}-${item}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.045 }}
              className="rounded-2xl border border-white/10 bg-white/[0.028] px-4 py-3 text-sm leading-relaxed text-white/62"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </section>
  );
};

export default DreamingPage;
