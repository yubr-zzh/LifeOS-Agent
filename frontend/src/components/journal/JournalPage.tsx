'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockData } from '../../lib/mockData';
import { Sparkles } from 'lucide-react';
import { runLifeOSAgent, submitFeedback, type LifeOSRunResponse } from '../../lib/api';

const JournalPage = () => {
  const [input, setInput] = useState(mockData.journalInputExample);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [streamText, setStreamText] = useState('');
  const [latestRun, setLatestRun] = useState<LifeOSRunResponse | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState('');

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setStreamText('');

    const fullText = "正在调用心魔照见法... 检索记忆库... 选择功法 Skills... 生成 Harness Trace...";
    let i = 0;
    
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setStreamText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(async () => {
          try {
            const run = await runLifeOSAgent(input);
            localStorage.setItem('lifeos:lastRun', JSON.stringify(run));
            setLatestRun(run);
            setFeedbackStatus('');
            setResult(run.parsedJournal);
          } catch (error) {
            console.warn('LifeOS backend unavailable, falling back to mock data', error);
            setResult(mockData.parsedJournal);
          }
          setIsAnalyzing(false);
        }, 600);
      }
    }, 35);
  };

  const handleFeedback = async (
    rating: 'too_hard' | 'just_right' | 'helpful' | 'not_helpful',
    planFit: string,
    note: string
  ) => {
    if (!latestRun?.harnessTrace?.traceId) {
      setFeedbackStatus('当前是本地 mock 结果，未写入反馈闭环。');
      return;
    }

    setFeedbackStatus('正在写入反馈并触发二次进化...');
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
      setFeedbackStatus(`反馈已写入：${feedback.skillEvolution.map((item) => `${item.param} → ${item.to}`).join('，')}`);
    } catch (error) {
      console.warn('Feedback failed', error);
      setFeedbackStatus('反馈写入失败，请确认后端已启动。');
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-10">
      <div className="flex gap-8 h-[calc(100vh-5rem)]">
        {/* Input Area */}
        <div className="flex-1 bg-zinc-950 border border-white/10 rounded-3xl p-10 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3 text-violet-300 mb-2">
              <Sparkles className="w-5 h-5" />
              <div className="font-medium tracking-widest text-sm">今日修炼记录</div>
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">向天道汇报</h2>
            <p className="text-white/40 mt-3 text-lg">以心声为笔，以经历为墨</p>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-black/60 border border-white/10 rounded-3xl p-8 text-lg leading-relaxed text-white placeholder:text-white/30 focus:outline-none resize-none font-light"
            placeholder="今日修炼如何？记录你的学习、项目、情绪、困惑……"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.985 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="mt-8 w-full py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-70 text-white text-xl font-medium rounded-3xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-violet-500/30"
          >
            {isAnalyzing ? (
              <>正在与天机沟通 <span className="animate-pulse">🌀</span></>
            ) : (
              <>开始修炼 • 提交日志</>
            )}
          </motion.button>

          <div className="text-center text-[10px] text-white/30 mt-6 font-mono">ESC 键可随时中断</div>
        </div>

        {/* Analysis Result */}
        <div className="flex-1 bg-zinc-950 border border-white/10 rounded-3xl p-9 flex flex-col overflow-hidden">
          <div className="uppercase text-xs tracking-widest mb-6 text-cyan-400 flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />AGENT 解析结果
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {isAnalyzing && (
            <div className="flex-1 flex items-center justify-center flex-col">
              <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent animate-spin rounded-full mb-8"></div>
              <div className="font-mono text-sm text-white/60">{streamText}</div>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 overflow-auto space-y-10 pr-3 custom-scroll"
              >
                {/* Achievements */}
                <div>
                  <div className="text-emerald-400 text-xs mb-4 flex items-center gap-2">
                    <span>✓</span> 今日修炼成果
                  </div>
                  <ul className="space-y-3 text-sm">
                    {result.achievements.map((item: string, i: number) => (
                      <li key={i} className="pl-6 border-l-2 border-emerald-500/40 text-white/90">• {item}</li>
                    ))}
                  </ul>
                </div>

                {/* Heart Demon */}
                <div>
                  <div className="flex items-center gap-3 text-red-400 text-xs mb-4">
                    <span className="text-base">☠︎</span> 今日心魔
                  </div>
                  <div className="inline-flex flex-wrap gap-2">
                    {result.heartDemons.map((d: string, i: number) => (
                      <div key={i} className="bg-red-900/30 text-red-300 text-xs px-5 py-2 rounded-3xl border border-red-500/30">
                        {d}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-amber-400 text-xs mb-3">情绪状态</div>
                    <div className="text-white text-[15px] leading-snug bg-white/5 border border-white/10 rounded-2xl p-6">
                      {result.emotion}
                    </div>
                  </div>
                  <div>
                    <div className="text-sky-400 text-xs mb-3">项目进展</div>
                    <div className="text-white text-[15px] leading-snug bg-white/5 border border-white/10 rounded-2xl p-6">
                      {result.projectProgress}
                    </div>
                  </div>
                </div>

                {/* Tomorrow Plan */}
                <div>
                  <div className="text-violet-400 text-xs mb-4">明日周天规划</div>
                  <div className="space-y-2">
                    {result.tomorrowPlan.map((plan: string, idx: number) => (
                      <div key={idx} className="pl-5 border-l border-dashed border-violet-400 text-sm text-white/80">
                        {plan}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <div className="text-xs text-white/40 mb-4 font-medium">本次调用功法</div>
                  <div className="flex flex-wrap gap-3">
                    {result.skillsUsed.map((skill: string, idx: number) => (
                      <div key={idx} className="bg-white/5 text-xs px-5 py-3 rounded-2xl text-white/80 border border-white/10 font-mono">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Memory Updates */}
                <div className="bg-gradient-to-br from-emerald-900/30 to-transparent border border-emerald-500/30 rounded-3xl p-7">
                  <div className="uppercase text-emerald-400 text-xs mb-5 tracking-wider">记忆库更新 • MEMORY SYNC</div>
                  {result.memoryUpdates.map((update: string, i: number) => (
                    <div key={i} className="text-emerald-200 text-sm mb-4 flex items-start gap-3">
                      <span className="text-lg text-emerald-400 mt-px">⟡</span>
                      <span>{update}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 border border-cyan-400/20 rounded-3xl p-7">
                  <div className="uppercase text-cyan-300 text-xs mb-4 tracking-wider">USER FEEDBACK → SECOND EVOLUTION</div>
                  <div className="text-white/50 text-sm mb-5">
                    评价这次计划是否适合你，反馈会写入 Harness trace，并触发 Memory / Skill 二次进化。
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleFeedback('too_hard', 'too_heavy', '计划方向有用，但任务粒度偏大，需要微任务。')}
                      className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100 hover:bg-red-400/20"
                    >
                      计划太重
                    </button>
                    <button
                      onClick={() => handleFeedback('just_right', 'fit', '计划强度和节奏刚好，可以继续沿用。')}
                      className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 hover:bg-emerald-400/20"
                    >
                      刚刚好
                    </button>
                    <button
                      onClick={() => handleFeedback('helpful', 'helpful', '建议有帮助，可以强化本次调用的功法组合。')}
                      className="rounded-2xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-sm text-violet-100 hover:bg-violet-400/20"
                    >
                      有帮助
                    </button>
                  </div>
                  {feedbackStatus && (
                    <div className="mt-4 rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-xs text-white/60">
                      {feedbackStatus}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !isAnalyzing && (
            <div className="flex-1 flex items-center justify-center text-white/30 text-center">
              <div>
                提交日志后<br />Agent 将自动唤醒<br />并完成一次完整的<br />「修炼闭环」
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
