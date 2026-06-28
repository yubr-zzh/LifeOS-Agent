'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockData } from '../../lib/mockData';
import { ArrowRight, BrainCircuit, FileText, RefreshCw } from 'lucide-react';
import { getLatestHarnessTrace, getMemoryFiles, runDreaming, type DreamReport, type MemoryFile } from '../../lib/api';

const HarnessPage = () => {
  const [trace, setTrace] = useState(mockData.harnessTrace);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isDreaming, setIsDreaming] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [dream, setDream] = useState<DreamReport | null>(null);
  const [memoryFiles, setMemoryFiles] = useState<MemoryFile[]>([]);

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
      .catch((error) => {
        console.warn('LifeOS backend unavailable, using mock trace', error);
      });

    getMemoryFiles()
      .then((result) => setMemoryFiles(result.files ?? []))
      .catch((error) => {
        console.warn('LifeOS memory vault unavailable', error);
      });
  }, []);

  const handleDreaming = async () => {
    setIsDreaming(true);
    try {
      const result = await runDreaming();
      setDream(result.dream);
      setMemoryFiles(result.memoryFiles);
    } catch (error) {
      console.warn('Dreaming failed', error);
    } finally {
      setIsDreaming(false);
    }
  };

  const replayHarness = () => {
    setIsReplaying(true);
    setActiveStep(0);
    
    const steps = [0, 1, 2, 3, 4, 5, 6];
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setActiveStep(steps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsReplaying(false);
      }
    }, 680);
  };

  const steps = [
    { title: "用户原始输入", icon: "📜" },
    { title: "检索 Memory 库", icon: "🧠" },
    { title: "激活功法 (Skills)", icon: "⚔️" },
    { title: "Agent 输出结果", icon: "📜" },
    { title: "多维评估指标", icon: "📊" },
    { title: "Memory 更新记录", icon: "📝" },
    { title: "Skill 自我进化", icon: "🌱" },
  ];

  return (
    <div className="p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="font-mono uppercase text-xs text-cyan-400 mb-2 tracking-[4px]">OBSERVABILITY SUITE</div>
            <h1 className="text-6xl font-bold text-white tracking-[-2px]">Agent Harness</h1>
            <p className="text-xl text-white/40 mt-3">修仙智能体可观测调试台</p>
          </div>
          
          <motion.button 
            onClick={replayHarness}
            disabled={isReplaying}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/20 px-8 py-4 rounded-2xl text-sm uppercase tracking-wider disabled:opacity-50"
          >
            <RefreshCw className={isReplaying ? "animate-spin" : ""} size={18} />
            重新执行完整流程
          </motion.button>
        </div>

        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 lg:col-span-7 bg-zinc-950 border border-cyan-400/30 rounded-3xl p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 text-cyan-300 text-xs uppercase tracking-[3px] mb-3">
                  <BrainCircuit size={18} />
                  DREAMING ENGINE
                </div>
                <h2 className="text-3xl font-bold text-white">离线自省与夜间凝练</h2>
                <p className="text-white/45 mt-3 leading-relaxed">
                  Dreaming 会读取近期 Harness traces，把白天的行为轨迹压缩成长期记忆、Skill 调参建议和下一轮实验。
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={handleDreaming}
                disabled={isDreaming}
                className="shrink-0 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-6 py-4 text-sm font-medium text-cyan-100 disabled:opacity-50"
              >
                {isDreaming ? 'Dreaming...' : '运行 Dreaming'}
              </motion.button>
            </div>

            {dream ? (
              <div className="mt-8 grid gap-5">
                <div className="rounded-2xl bg-black/50 border border-white/10 p-5 text-white/80">
                  {dream.summary}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
                    <div className="text-xs text-cyan-300 mb-3 uppercase">Observations</div>
                    <div className="space-y-2 text-sm text-white/70">
                      {dream.observations.map((item) => <div key={item}>• {item}</div>)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
                    <div className="text-xs text-emerald-300 mb-3 uppercase">Next Experiments</div>
                    <div className="space-y-2 text-sm text-white/70">
                      {dream.nextExperiments.map((item) => <div key={item}>• {item}</div>)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-6 text-sm text-white/35">
                运行 Dreaming 后，这里会展示离线反思报告。
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-5 bg-zinc-950 border border-violet-400/30 rounded-3xl p-8">
            <div className="flex items-center gap-3 text-violet-300 text-xs uppercase tracking-[3px] mb-3">
              <FileText size={18} />
              FILE-SYSTEM MEMORY
            </div>
            <h2 className="text-3xl font-bold text-white">文件式系统内存</h2>
            <p className="text-white/45 mt-3 leading-relaxed">
              Memory、Skills、Traces 和 Dreams 会同步为 Markdown，形成可审查、可编辑、可迁移的 Agent 记忆库。
            </p>

            <div className="mt-7 max-h-72 overflow-auto custom-scroll space-y-2 pr-2">
              {memoryFiles.length ? memoryFiles.slice(0, 12).map((file) => (
                <div key={file.path} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                  <div className="font-mono text-xs text-violet-200">{file.path}</div>
                  <div className="mt-1 text-[11px] text-white/35 line-clamp-2">
                    {file.content.replace(/---[\s\S]*?---/, '').trim().slice(0, 120)}
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-white/35">
                  后端启动后会自动生成 memory vault 文件。
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {steps.map((stepInfo, idx) => {
            const isActive = activeStep === idx || (!isReplaying && idx <= 6);
            return (
              <motion.div 
                key={idx}
                initial={false}
                animate={{ 
                  opacity: isActive ? 1 : 0.4,
                  scale: isActive ? 1 : 0.985 
                }}
                className={`border ${isActive ? 'border-violet-400/70 shadow-2xl shadow-violet-500/30' : 'border-white/10'} bg-zinc-950 rounded-3xl overflow-hidden transition-all`}
              >
                <div className="px-9 py-6 bg-black/60 flex items-center gap-6 border-b border-white/10">
                  <div className="text-4xl w-12">{stepInfo.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-white">STEP {idx + 1} — {stepInfo.title}</div>
                    <div className="text-xs text-white/40 font-mono">trace_001 • 2026-06-29 14:22:09</div>
                  </div>
                  {isActive && <div className="text-[10px] px-3 py-1 rounded bg-emerald-400 text-black font-medium">LIVE</div>}
                </div>

                <div className="p-9 text-sm">
                  <AnimatePresence mode="wait">
                    {idx === 0 && (
                      <div className="font-light text-lg text-white/80 border-l-4 border-violet-400 pl-8 py-2 italic">
                        “{trace.input}”
                      </div>
                    )}

                    {idx === 1 && (
                      <div className="space-y-6">
                        {trace.retrievedMemory.map((mem, i) => (
                          <div key={i} className="flex gap-6 bg-zinc-900 rounded-2xl p-6 border border-white/5">
                            <div>
                              <div className="uppercase text-[10px] text-white/40">MEMORY</div>
                              <div className={`mt-1 text-xs uppercase font-medium px-3 py-px inline-block rounded ${mem.type.includes('pattern') ? 'bg-orange-400/10 text-orange-400' : 'bg-sky-400/10 text-sky-400'}`}>
                                {mem.type.replace('_', ' ')}
                              </div>
                            </div>
                            <div className="flex-1 text-white/80">{mem.content}</div>
                            <div className="text-right font-mono text-xs">
                              <div className="text-emerald-400">{mem.confidence * 100}%</div>
                              <div className="text-white/30 text-[10px]">{mem.lastUpdated}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {idx === 2 && (
                      <div className="grid grid-cols-2 gap-4">
                        {trace.selectedSkills.map((skill, i) => (
                          <div key={i} className="bg-zinc-900/70 p-6 rounded-2xl border border-white/10">
                            <div className="flex justify-between">
                              <div>
                                <div className="text-lg font-medium text-violet-200">{skill.name}</div>
                                <div className="font-mono text-xs text-white/50">{skill.skillId}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-4xl font-bold text-white/80 tabular-nums">{skill.score}</div>
                                <div className="text-[10px] -mt-1 text-white/30">SCORE</div>
                              </div>
                            </div>
                            <div className="mt-8 text-xs text-white/40">触发条件：<span className="text-white/70">{skill.trigger}</span></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {idx === 3 && (
                      <div className="bg-black p-8 rounded-2xl text-white/80 text-[15px] leading-relaxed border border-dashed border-white/20">
                        今日修炼成果已入库。<br/>心魔已被照见，规划已生成。<br/>Memory 同步完成，境界微升。
                      </div>
                    )}

                    {idx === 4 && (
                      <div className="grid grid-cols-3 gap-6">
                        {Object.entries(trace.evaluation).map(([key, value]) => (
                          <div key={key} className="bg-zinc-900 rounded-3xl p-8 text-center border border-white/5">
                            <div className="text-xs uppercase mb-5 text-white/40 tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="text-7xl font-light text-white tracking-tighter tabular-nums">{value}</div>
                            <div className="h-2 mt-8 bg-white/10 rounded-full">
                              <div className="h-2 bg-gradient-to-r from-fuchsia-400 to-cyan-400 rounded-full" style={{ width: `${value * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {idx === 5 && (
                      <div className="space-y-4">
                        {trace.memoryUpdates.map((update, index) => (
                          <div key={index} className="flex gap-4 items-start bg-emerald-900/20 border border-emerald-400/30 px-8 py-6 rounded-2xl">
                            <div className="text-3xl text-emerald-400">⟡</div>
                            <div className="text-emerald-100 text-[15px]">{update}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {idx === 6 && (
                      <div>
                        <div className="text-xs font-mono text-white/40 mb-6">SKILL EVOLUTION LOG</div>
                        {trace.skillEvolution.map((change, index) => (
                          <div key={index} className="flex items-center gap-8 mb-5 border-l-2 border-white/30 pl-8">
                            <div className="font-mono text-sm text-white/70 w-56">{change.param}</div>
                            <div className="flex-1 text-white/50 text-sm">{change.from}</div>
                            <ArrowRight className="text-violet-400" />
                            <div className="flex-1 font-medium text-emerald-300 text-sm">{change.to}</div>
                          </div>
                        ))}
                        <div className="text-center text-xs text-white/30 mt-12">Skill 参数已完成自适应优化</div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12 text-xs text-white/30 font-light">
          Harness 闭环已完整演示 • 所有数据均为模拟
        </div>
      </div>
    </div>
  );
};

export default HarnessPage;
