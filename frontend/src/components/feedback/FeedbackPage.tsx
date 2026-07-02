import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, GitBranch, Loader2, MessageSquareHeart, RefreshCw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { getLifeOSState, submitFeedback, type FeedbackResponse, type LifeOSState } from '../../lib/api';

type Rating = 'too_hard' | 'just_right' | 'helpful' | 'not_helpful';

const feedbackOptions: Array<{
  rating: Rating;
  label: string;
  planFit: string;
  adopted: string;
  note: string;
  description: string;
}> = [
  {
    rating: 'too_hard',
    label: '计划太重',
    planFit: 'too_heavy',
    adopted: 'partially',
    note: '计划方向有用，但任务粒度偏大，需要拆成更小的微任务。',
    description: '降低 planning.intensity，提升 taskGranularity。',
  },
  {
    rating: 'just_right',
    label: '刚刚好',
    planFit: 'fit',
    adopted: 'yes',
    note: '计划强度和节奏刚好，可以继续沿用当前策略。',
    description: '保持当前策略权重，强化可执行计划模板。',
  },
  {
    rating: 'helpful',
    label: '很有帮助',
    planFit: 'helpful',
    adopted: 'yes',
    note: '建议有帮助，可以强化本次调用的 Skill 组合。',
    description: '提高相关 Skills 的 score，进入下一轮 Dreaming 材料。',
  },
  {
    rating: 'not_helpful',
    label: '没帮上忙',
    planFit: 'mismatch',
    adopted: 'no',
    note: '建议没有贴合当前状态，需要重新校准 Memory 与 Skill 选择。',
    description: '标记策略失配，促使后续检索和技能选择收敛。',
  },
];

const FeedbackPage = () => {
  const [state, setState] = useState<LifeOSState | null>(null);
  const [selected, setSelected] = useState<Rating>('too_hard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('选择一次反馈，LifeOS 会把它写入 trace，并驱动 Skill 参数与后续计划策略进化。');
  const [response, setResponse] = useState<FeedbackResponse | null>(null);

  const refreshState = async () => {
    const nextState = await getLifeOSState();
    setState(nextState);
  };

  useEffect(() => {
    refreshState().catch((error) => {
      console.warn('Feedback state unavailable', error);
      setStatus('暂未连接后端。页面仍展示 Feedback Evolution 的产品入口形态。');
    });
  }, []);

  const latestTrace = state?.latestTrace ?? state?.traces?.at(-1) ?? null;
  const latestFeedback = response?.feedback ?? state?.feedbacks?.at(-1) ?? null;
  const selectedOption = feedbackOptions.find((item) => item.rating === selected) ?? feedbackOptions[0];

  const evidenceCards = useMemo(() => {
    const steps = response?.traceSteps ?? latestFeedback?.traceSteps ?? [];
    return [
      { label: 'Target Trace', value: latestTrace?.traceId?.replace('trace_', '').slice(0, 12) ?? 'waiting', hint: '反馈绑定最近一次 Agent run' },
      { label: 'Feedback Steps', value: `${steps.length}`, hint: '反馈也会产生可回放 traceSteps' },
      { label: 'Skill Changes', value: `${response?.skillEvolution?.length ?? 0}`, hint: '参数变化写回 Skill Registry' },
    ];
  }, [latestFeedback?.traceSteps, latestTrace?.traceId, response]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setStatus('正在写入反馈进化链路...');
    try {
      const result = await submitFeedback({
        traceId: latestTrace?.traceId,
        rating: selectedOption.rating,
        planFit: selectedOption.planFit,
        adopted: selectedOption.adopted,
        note: selectedOption.note,
      });
      setResponse(result);
      await refreshState();
      setStatus(`反馈已写入：${result.feedback.feedbackId}`);
    } catch (error) {
      console.warn('Feedback submit failed', error);
      setStatus('反馈写入失败，请确认后端已启动，且至少有一次 Agent run。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-auto p-8 pr-10 custom-scroll">
      <div className="mb-8 flex items-end justify-between gap-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200/20 bg-rose-200/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-rose-100/75">
            <MessageSquareHeart size={14} />
            Feedback Evolution
          </div>
          <h1 className="text-5xl font-black tracking-[-0.045em] text-white">反馈进化</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/45">
            用户反馈不是表态按钮，而是 LifeOS 的自进化信号。它会进入 Harness trace，影响 Skill 参数、计划强度和下一轮 Dreaming。
          </p>
        </div>
        <button
          onClick={() => refreshState().catch(() => setStatus('刷新失败，请确认后端已启动。'))}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-white/68 transition hover:border-rose-200/25 hover:text-white"
        >
          <RefreshCw size={18} />
          刷新状态
        </button>
      </div>

      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-sm text-white/55">{status}</div>

      <div className="grid grid-cols-12 gap-5">
        <section className="glass-panel relative col-span-12 overflow-hidden rounded-[2rem] p-7 lg:col-span-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(251,113,133,.18),transparent_32%),radial-gradient(circle_at_72%_70%,rgba(94,234,212,.13),transparent_34%)]" />
          <div className="relative z-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Feedback Input</div>
                <div className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">校准这次 Agent 建议</div>
              </div>
              <div className="rounded-full border border-rose-200/18 bg-rose-200/[0.08] px-4 py-2 text-xs text-rose-50/70">
                {latestTrace ? 'trace ready' : 'waiting trace'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {feedbackOptions.map((option) => {
                const active = selected === option.rating;
                return (
                  <button
                    key={option.rating}
                    onClick={() => setSelected(option.rating)}
                    className={`min-h-[132px] rounded-[1.5rem] border p-5 text-left transition ${
                      active
                        ? 'border-rose-200/35 bg-rose-200/[0.11] text-white shadow-[0_0_42px_rgba(251,113,133,.13)]'
                        : 'border-white/10 bg-white/[0.035] text-white/58 hover:border-white/18 hover:text-white'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-lg font-bold">{option.label}</div>
                      {active && <CheckCircle2 size={18} className="text-rose-100" />}
                    </div>
                    <div className="text-sm leading-relaxed opacity-75">{option.description}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/35">将写入的反馈说明</div>
              <div className="text-sm leading-relaxed text-white/68">{selectedOption.note}</div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !latestTrace}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-rose-200 px-5 py-4 font-bold text-black transition hover:bg-rose-100 disabled:opacity-55"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <MessageSquareHeart size={18} />}
              写入 Feedback Evolution
            </button>
          </div>
        </section>

        <section className="col-span-12 space-y-5 lg:col-span-5">
          <div className="glass-panel rounded-[2rem] p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/78">
              <GitBranch size={18} className="text-teal-200" />
              反馈证据链
            </div>
            <div className="grid gap-3">
              {evidenceCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/32">{card.label}</div>
                  <div className="text-xl font-bold text-white/82">{card.value}</div>
                  <div className="mt-1 text-xs text-white/42">{card.hint}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/78">
              <SlidersHorizontal size={18} className="text-amber-200" />
              Skill 参数变化
            </div>
            <div className="space-y-3">
              {(response?.skillEvolution?.length ? response.skillEvolution : [{ param: 'planning.intensity', from: 0.8, to: selected === 'too_hard' ? 0.6 : 0.8 }]).map((item) => (
                <div key={item.param} className="rounded-2xl border border-amber-200/14 bg-amber-200/[0.045] p-4">
                  <div className="text-sm font-semibold text-white/78">{item.param}</div>
                  <div className="mt-2 font-mono text-xs text-amber-50/65">
                    {String(item.from)} -&gt; {String(item.to)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/78">
              <Sparkles size={18} className="text-violet-200" />
              后续影响
            </div>
            <div className="space-y-2 text-sm leading-relaxed text-white/54">
              <div>进入 Harness 的 Feedback evidence tab。</div>
              <div>成为 Dreaming 后台凝练的输入材料。</div>
              <div>影响下一次计划生成与 Skill 选择。</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FeedbackPage;
