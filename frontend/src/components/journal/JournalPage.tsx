import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DatabaseZap,
  FileText,
  History,
  ImagePlus,
  Loader2,
  MessageSquareText,
  Paperclip,
  Send,
  WandSparkles,
  X,
} from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { runLifeOSAgent, submitFeedback, type LifeOSRunResponse } from '../../lib/api';

type UploadedAsset = {
  name: string;
  url: string;
  type: string;
};

type ParsedJournal = typeof mockData.parsedJournal;

type PastJournalLog = {
  id: string;
  date: string;
  time: string;
  title: string;
  realm: string;
  rawInput: string;
  traceId: string;
  parsed: ParsedJournal;
};

const seedJournalLogs: PastJournalLog[] = [
  {
    id: 'journal-2026-06-29',
    date: '2026-06-29',
    time: '23:18',
    title: 'RAG 与 Harness 复盘',
    realm: '练气六层',
    rawInput: mockData.journalInputExample,
    traceId: 'trace_20260629_demo',
    parsed: mockData.parsedJournal,
  },
  {
    id: 'journal-2026-06-28',
    date: '2026-06-28',
    time: '22:47',
    title: '工程闭环接通',
    realm: '练气六层',
    rawInput: '今天把 LifeOS Agent 的后端闭环跑通了，trace、feedback、dreaming 与文件式记忆都能进入演示链路。前端还需要继续收束，让它更像产品。',
    traceId: 'trace_20260628_loop',
    parsed: {
      ...mockData.parsedJournal,
      achievements: ['Agent Harness 主链路跑通', '文件式 Memory 可被前端读取', 'Dreaming 机制完成一次后台沉淀'],
      heartDemons: ['页面信息密度偏高', '临近提交压力'],
      emotion: '兴奋与紧张并存，工程信心上升',
      projectProgress: 'LifeOS Agent 从概念进入可演示闭环',
      tomorrowPlan: ['压缩首页信息层级', '完善成长轨迹视觉', '准备路演演示脚本'],
      memoryUpdates: ['新增：用户更偏好产品化、视觉化表达', '更新：Harness 证据要藏在体验背后'],
    },
  },
  {
    id: 'journal-2026-06-24',
    date: '2026-06-24',
    time: '21:35',
    title: '核心 PRD 成型',
    realm: '练气五层',
    rawInput: '今天把 LifeOS 的定位、修仙框架、Memory、Skills、自进化和可视化方向整理出来了。感觉项目终于从想法变成可以落地的方案。',
    traceId: 'trace_20260624_prd',
    parsed: {
      ...mockData.parsedJournal,
      achievements: ['LifeOS Agent PRD 初稿完成', '修仙境界映射确定', 'MVP 范围收敛到日常记录与成长反馈'],
      heartDemons: ['担心工程量过大', '视觉方向仍不稳定'],
      emotion: '方向感明显增强，但对实现难度仍有压力',
      projectProgress: '完成产品需求、架构与 MVP 清单的第一轮定义',
      tomorrowPlan: ['拆分前后端任务', '优先实现日志输入闭环', '补充 README 与演示材料'],
      memoryUpdates: ['新增：用户希望修仙只是框架，Agent 工程是核心', '新增：视觉效果会显著影响项目观感'],
    },
  },
];

const buildJournalLog = (rawInput: string, parsed: ParsedJournal, traceId?: string): PastJournalLog => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  return {
    id: `${traceId || 'journal'}-${Date.now()}`,
    date,
    time,
    title: parsed.achievements[0] || '今日修炼复盘',
    realm: mockData.currentRealm,
    rawInput,
    traceId: traceId || 'mock_trace',
    parsed,
  };
};

const JournalPage = () => {
  const [input, setInput] = useState(mockData.journalInputExample);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof mockData.parsedJournal | null>(null);
  const [streamText, setStreamText] = useState('');
  const [latestRun, setLatestRun] = useState<LifeOSRunResponse | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pastLogs, setPastLogs] = useState<PastJournalLog[]>(seedJournalLogs);
  const [selectedLog, setSelectedLog] = useState<PastJournalLog>(seedJournalLogs[0]);

  const hasResult = Boolean(result);
  const inputShellClass = hasResult ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3';

  const assetSummary = useMemo(() => {
    if (!assets.length) return '可附加截图、白板、手写规划';
    return `${assets.length} 个附件已加入今日输入`;
  }, [assets.length]);

  const handleAssetUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const nextAssets = Array.from(files).slice(0, 4).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setAssets((current) => [...current, ...nextAssets].slice(0, 4));
  };

  const removeAsset = (name: string) => {
    setAssets((current) => current.filter((asset) => asset.name !== name));
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setStreamText('');

    const fullText = 'Memory retrieval -> Skill selection -> Reflection generation -> Harness evaluation -> Memory update';
    let i = 0;

    const interval = setInterval(() => {
      if (i < fullText.length) {
        setStreamText(fullText.slice(0, i + 1));
        i += 1;
      } else {
        clearInterval(interval);
        setTimeout(async () => {
          try {
            const enrichedInput = assets.length
              ? `${input}\n\n[attachments]\n${assets.map((asset) => `- ${asset.name}`).join('\n')}`
              : input;
            const run = await runLifeOSAgent(enrichedInput);
            localStorage.setItem('lifeos:lastRun', JSON.stringify(run));
            setLatestRun(run);
            setFeedbackStatus('');
            setResult(run.parsedJournal);
            const nextLog = buildJournalLog(enrichedInput, run.parsedJournal, run.harnessTrace?.traceId);
            setPastLogs((current) => [nextLog, ...current].slice(0, 8));
            setSelectedLog(nextLog);
          } catch (error) {
            console.warn('LifeOS backend unavailable, falling back to mock data', error);
            setResult(mockData.parsedJournal);
            const nextLog = buildJournalLog(input, mockData.parsedJournal);
            setPastLogs((current) => [nextLog, ...current].slice(0, 8));
            setSelectedLog(nextLog);
          }
          setIsAnalyzing(false);
        }, 450);
      }
    }, 22);
  };

  const handleFeedback = async (
    rating: 'too_hard' | 'just_right' | 'helpful' | 'not_helpful',
    planFit: string,
    note: string,
  ) => {
    if (!latestRun?.harnessTrace?.traceId) {
      setFeedbackStatus('当前是 mock 结果，未写入反馈闭环。');
      return;
    }

    setFeedbackStatus('正在写入反馈，并触发 Skill 二次进化...');
    try {
      const feedback = await submitFeedback({
        traceId: latestRun.harnessTrace.traceId,
        rating,
        planFit,
        adopted: rating === 'too_hard' ? 'partially' : 'yes',
        note,
      });
      const nextRun = {
        ...latestRun,
        harnessTrace: feedback.updatedTrace,
      };
      localStorage.setItem('lifeos:lastRun', JSON.stringify(nextRun));
      setLatestRun(nextRun);
      setFeedbackStatus(`反馈已写入：${feedback.skillEvolution.map((item) => `${item.param} -> ${item.to}`).join('；') || '策略保持稳定'}`);
    } catch (error) {
      console.warn('Feedback failed', error);
      setFeedbackStatus('反馈写入失败，请确认后端已启动。');
    }
  };

  return (
    <div className="h-screen overflow-auto p-8 pr-10 custom-scroll">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-amber-100/75">
            <MessageSquareText size={14} />
            Daily Input
          </div>
          <h1 className="text-5xl font-black tracking-[-0.045em] text-white">修炼日志</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/45">
            先把今天的学习、项目推进、情绪和卡点交给 LifeOS。提交后，Agent 会生成复盘、明日计划、记忆更新与反馈进化入口。
          </p>
        </div>
        <div className="relative z-30 mt-1 shrink-0 lg:mr-44">
          <button
            onClick={() => setHistoryOpen((open) => !open)}
            className="group flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-4 py-3 text-sm font-semibold text-white/72 shadow-2xl shadow-black/25 backdrop-blur-xl transition hover:border-teal-200/30 hover:bg-teal-200/10 hover:text-teal-50"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-teal-200/20 bg-teal-200/10 text-teal-100">
              <History size={16} />
            </span>
            往昔日志
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/42">{pastLogs.length}</span>
          </button>

          <AnimatePresence>
            {historyOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-14 w-[620px] overflow-hidden rounded-[1.6rem] border border-teal-200/15 bg-[#071018]/95 shadow-[0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-white/82">
                      <CalendarDays size={16} className="text-teal-200" />
                      往昔修炼日志
                    </div>
                    <div className="mt-1 text-xs text-white/38">点击一条记录，查看当日复盘、心魔、计划与记忆更新。</div>
                  </div>
                  <button onClick={() => setHistoryOpen(false)} className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-white/50 transition hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                <div className="grid max-h-[520px] grid-cols-[240px_1fr]">
                  <div className="space-y-2 overflow-auto border-r border-white/10 p-3 custom-scroll">
                    {pastLogs.map((log) => (
                      <button
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          selectedLog.id === log.id
                            ? 'border-teal-200/35 bg-teal-200/10'
                            : 'border-white/8 bg-white/[0.025] hover:border-white/18 hover:bg-white/[0.055]'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-white/38">
                          <span>{log.date}</span>
                          <span>{log.time}</span>
                        </div>
                        <div className="line-clamp-2 text-sm font-bold leading-snug text-white/78">{log.title}</div>
                        <div className="mt-3 flex items-center justify-between text-[11px]">
                          <span className="rounded-full border border-amber-200/15 bg-amber-200/8 px-2 py-1 text-amber-100/70">{log.realm}</span>
                          <ChevronRight size={14} className="text-white/28" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <JournalHistoryDetail log={selectedLog} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-12rem)] grid-cols-12 gap-5">
        <motion.section layout className={`glass-panel col-span-12 flex flex-col rounded-[2rem] p-6 ${inputShellClass}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white/78">今日输入</div>
              <div className="mt-1 text-xs text-white/35">{assetSummary}</div>
            </div>
            <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
              journal.md
            </div>
          </div>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-[320px] flex-1 resize-none rounded-[1.4rem] border border-white/10 bg-black/35 p-5 text-[15px] leading-8 text-white/82 outline-none transition placeholder:text-white/25 focus:border-teal-200/35"
            placeholder="记录今天的学习、项目、情绪、卡点与明天想推进的事..."
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            {assets.map((asset) => (
              <div key={asset.name} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <button onClick={() => removeAsset(asset.name)} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white/60">
                  <X size={13} />
                </button>
                {asset.type.startsWith('image/') ? (
                  <img src={asset.url} alt={asset.name} className="h-20 w-full rounded-xl object-cover" />
                ) : (
                  <div className="grid h-20 place-items-center rounded-xl bg-black/25 text-white/35">
                    <Paperclip size={18} />
                  </div>
                )}
                <div className="mt-2 truncate text-xs text-white/52">{asset.name}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-sm text-white/68 transition hover:border-teal-200/25 hover:text-teal-50">
              <ImagePlus size={18} />
              上传图片
              <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleAssetUpload(event.target.files)} />
            </label>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-3 rounded-2xl bg-teal-200 px-5 py-4 font-bold text-black transition hover:bg-teal-100 disabled:opacity-60"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {isAnalyzing ? 'Agent 正在运行闭环' : '提交给 LifeOS Agent'}
            </button>
          </div>
        </motion.section>

        <AnimatePresence>
          {(isAnalyzing || result) && (
            <motion.section
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className="glass-panel col-span-12 flex flex-col overflow-hidden rounded-[2rem] p-6 lg:col-span-7"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/78">
                  <WandSparkles size={18} className="text-teal-200" />
                  Agent 解析结果
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/32">Harness visible</div>
              </div>

              {isAnalyzing && (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <Loader2 className="mb-6 h-8 w-8 animate-spin text-teal-200" />
                  <div className="font-mono text-sm text-white/60">{streamText}</div>
                </div>
              )}

              {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-0 flex-1 overflow-auto pr-2 custom-scroll">
                  <div className="grid grid-cols-2 gap-4">
                    <ResultBlock title="今日成果" tone="emerald" items={result.achievements} />
                    <ResultBlock title="心魔识别" tone="rose" items={result.heartDemons} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <InfoBlock title="情绪状态" value={result.emotion} />
                    <InfoBlock title="项目推进" value={result.projectProgress} />
                  </div>

                  <PlanBlock plans={result.tomorrowPlan} />
                  <MemoryBlock updates={result.memoryUpdates} />

                  <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5">
                    <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/45">用户反馈驱动二次进化</div>
                    <div className="grid grid-cols-3 gap-3">
                      <FeedbackButton label="计划太重" onClick={() => handleFeedback('too_hard', 'too_heavy', '计划方向有用，但任务粒度偏大，需要微任务。')} />
                      <FeedbackButton label="刚刚好" onClick={() => handleFeedback('just_right', 'fit', '计划强度和节奏刚好，可以继续沿用。')} />
                      <FeedbackButton label="很有帮助" onClick={() => handleFeedback('helpful', 'helpful', '建议有帮助，可以强化本次调用的 Skill 组合。')} />
                    </div>
                    {feedbackStatus && <div className="mt-4 rounded-xl border border-white/10 bg-black/28 px-4 py-3 text-xs text-white/58">{feedbackStatus}</div>}
                  </div>
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ResultBlock = ({ title, tone, items }: { title: string; tone: 'emerald' | 'rose'; items: string[] }) => {
  const toneClass = tone === 'emerald' ? 'border-emerald-200/15 bg-emerald-200/[0.055] text-emerald-50/78' : 'border-rose-200/15 bg-rose-200/[0.055] text-rose-50/78';
  return (
    <div className={`rounded-[1.4rem] border p-5 ${toneClass}`}>
      <div className="mb-4 text-xs uppercase tracking-[0.2em] opacity-70">{title}</div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="text-sm leading-relaxed">{item}</div>
        ))}
      </div>
    </div>
  );
};

const InfoBlock = ({ title, value }: { title: string; value: string }) => (
  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5">
    <div className="mb-3 text-xs uppercase tracking-[0.2em] text-white/35">{title}</div>
    <div className="text-sm leading-relaxed text-white/72">{value}</div>
  </div>
);

const PlanBlock = ({ plans }: { plans: string[] }) => (
  <div className="mt-4 rounded-[1.4rem] border border-indigo-200/15 bg-indigo-200/[0.055] p-5">
    <div className="mb-4 text-xs uppercase tracking-[0.2em] text-indigo-100/70">明日周天计划</div>
    <div className="space-y-3">
      {plans.map((plan, index) => (
        <div key={index} className="flex gap-3 text-sm leading-relaxed text-white/72">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-indigo-200" />
          {plan}
        </div>
      ))}
    </div>
  </div>
);

const MemoryBlock = ({ updates }: { updates: string[] }) => (
  <div className="mt-4 rounded-[1.4rem] border border-teal-200/15 bg-teal-200/[0.055] p-5">
    <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-teal-100/70">
      <DatabaseZap size={15} />
      Memory Sync
    </div>
    <div className="space-y-3">
      {updates.map((update, index) => (
        <div key={index} className="flex gap-3 text-sm leading-relaxed text-teal-50/75">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />
          {update}
        </div>
      ))}
    </div>
  </div>
);

const FeedbackButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button onClick={onClick} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70 transition hover:border-teal-200/25 hover:bg-teal-200/8 hover:text-teal-50">
    {label}
  </button>
);

const JournalHistoryDetail = ({ log }: { log: PastJournalLog }) => (
  <div className="min-h-0 overflow-auto p-5 custom-scroll">
    <div className="mb-4 rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-black tracking-[-0.03em] text-white">{log.title}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/42">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={13} />
              {log.date} {log.time}
            </span>
            <span className="rounded-full border border-teal-200/15 bg-teal-200/8 px-2 py-1 text-teal-100/70">{log.realm}</span>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/32">
          {log.traceId}
        </div>
      </div>
      <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-sm leading-7 text-white/62">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/32">
          <FileText size={13} />
          Raw Journal
        </div>
        {log.rawInput}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <CompactHistoryBlock title="成果" items={log.parsed.achievements} accent="teal" />
      <CompactHistoryBlock title="心魔" items={log.parsed.heartDemons} accent="rose" />
    </div>

    <div className="mt-3 rounded-[1.25rem] border border-indigo-200/12 bg-indigo-200/[0.045] p-4">
      <div className="mb-3 text-xs uppercase tracking-[0.18em] text-indigo-100/55">明日计划</div>
      <div className="space-y-2">
        {log.parsed.tomorrowPlan.map((plan, index) => (
          <div key={index} className="flex gap-2 text-sm leading-relaxed text-white/68">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-200" />
            {plan}
          </div>
        ))}
      </div>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-3">
      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-2 text-xs uppercase tracking-[0.18em] text-white/32">情绪</div>
        <div className="text-sm leading-relaxed text-white/66">{log.parsed.emotion}</div>
      </div>
      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-2 text-xs uppercase tracking-[0.18em] text-white/32">项目推进</div>
        <div className="text-sm leading-relaxed text-white/66">{log.parsed.projectProgress}</div>
      </div>
    </div>

    <div className="mt-3 rounded-[1.25rem] border border-teal-200/12 bg-teal-200/[0.045] p-4">
      <div className="mb-3 text-xs uppercase tracking-[0.18em] text-teal-100/55">Memory 更新</div>
      <div className="space-y-2">
        {log.parsed.memoryUpdates.map((item, index) => (
          <div key={index} className="flex gap-2 text-sm leading-relaxed text-teal-50/70">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CompactHistoryBlock = ({ title, items, accent }: { title: string; items: string[]; accent: 'teal' | 'rose' }) => {
  const accentClass = accent === 'teal' ? 'border-teal-200/12 bg-teal-200/[0.045] text-teal-50/70' : 'border-rose-200/12 bg-rose-200/[0.045] text-rose-50/70';
  return (
    <div className={`rounded-[1.25rem] border p-4 ${accentClass}`}>
      <div className="mb-3 text-xs uppercase tracking-[0.18em] opacity-65">{title}</div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="text-sm leading-relaxed">{item}</div>
        ))}
      </div>
    </div>
  );
};

export default JournalPage;
