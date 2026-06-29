import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Sparkles, Target, Waves } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { getLifeOSState, type LifeOSState } from '../../lib/api';
import { Progress } from './ProgressBar';

const DashboardPage = () => {
  const [state, setState] = useState<LifeOSState | null>(null);

  useEffect(() => {
    getLifeOSState()
      .then(setState)
      .catch((error) => {
        console.warn('LifeOS state unavailable, using dashboard mock', error);
      });
  }, []);

  const latestLog = state?.logs?.length ? state.logs[state.logs.length - 1] : undefined;
  const latestTrace = state?.latestTrace;
  const liveHeartDemons: string[] = latestTrace?.parsedSignals?.heartDemons ?? [];
  const liveTasks = latestLog?.nextActions?.map((title: string, index: number) => ({
    id: index + 1,
    title,
    completed: index === 0,
  }));

  const dashboard = useMemo(() => {
    if (!state?.profile) {
      return {
        cultivatorName: mockData.cultivatorName,
        currentRealm: mockData.currentRealm,
        totalProgress: mockData.totalProgress,
        subRealms: mockData.subRealms,
        todayTasks: mockData.todayTasks,
        heartDemons: mockData.heartDemons,
        recentBreakthroughs: mockData.recentBreakthroughs,
      };
    }

    return {
      cultivatorName: state.profile.name,
      currentRealm: state.profile.overallRealm,
      totalProgress: state.profile.totalProgress,
      subRealms: state.profile.subRealms.map((realm) => ({
        name: realm.name,
        level: realm.realm,
        progress: realm.progress,
        color: realm.color ?? '#5eead4',
      })),
      todayTasks: liveTasks?.length ? liveTasks : mockData.todayTasks,
      heartDemons: liveHeartDemons.length
        ? liveHeartDemons.map((name: string, index: number) => ({
            name,
            intensity: Math.max(48, 86 - index * 10),
          }))
        : mockData.heartDemons,
      recentBreakthroughs: [
        ...(latestLog?.achievements ?? []),
        ...(state.dreams?.length ? state.dreams[state.dreams.length - 1].nextExperiments : []),
      ].slice(0, 3),
    };
  }, [latestLog, liveHeartDemons, liveTasks, state]);

  const { cultivatorName, currentRealm, totalProgress, subRealms, todayTasks, heartDemons, recentBreakthroughs } = dashboard;

  return (
    <div className="h-screen overflow-auto p-8 pr-10 custom-scroll">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-teal-100/75">
            <Sparkles size={14} />
            Cultivation Console
          </div>
          <h1 className="text-6xl font-black tracking-[-0.055em] text-white">{cultivatorName}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="gold-chip rounded-full px-5 py-2 text-sm font-bold">{currentRealm}</span>
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-white/35">LifeOS growth state</span>
          </div>
        </div>

        <div className="glass-panel w-[300px] rounded-[1.6rem] p-5">
          <div className="mb-2 flex items-center justify-between text-sm text-white/55">
            <span>总境界进度</span>
            <span className="font-mono text-teal-100">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} color="#5eead4" />
          <div className="mt-3 text-xs text-white/38">由稳定执行、复盘质量、项目推进、心魔改善与 Skill 熟练度共同计算。</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="glass-panel relative col-span-12 min-h-[520px] overflow-hidden rounded-[2rem] p-8 lg:col-span-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(94,234,212,.28),transparent_28%),radial-gradient(circle_at_52%_48%,rgba(246,199,104,.16),transparent_42%)]" />
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(94,234,212,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(94,234,212,.08)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute left-8 top-8 z-10 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs text-white/50 backdrop-blur-xl">动态洞府灵核</div>

          <div className="absolute inset-x-12 bottom-12 top-20">
            {Array.from({ length: 26 }).map((_, index) => {
              const angle = (index / 26) * Math.PI * 2;
              const radius = 38 + (index % 4) * 7;
              return (
                <motion.span
                  key={`particle-${index}`}
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-teal-100 shadow-[0_0_18px_rgba(94,234,212,.95)]"
                  style={{
                    x: `${Math.cos(angle) * radius * 4}px`,
                    y: `${Math.sin(angle) * radius * 2.6}px`,
                  }}
                  animate={{
                    opacity: [0.22, 1, 0.22],
                    scale: [0.65, 1.45, 0.65],
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3.4 + (index % 5) * 0.35,
                    repeat: Infinity,
                    delay: index * 0.07,
                  }}
                />
              );
            })}

            <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-200/25" style={{ animation: 'pulse-ring 3.8s ease-out infinite' }} />
            <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-teal-100/18" style={{ animation: 'slow-spin 36s linear infinite reverse' }} />
            <div className="absolute left-1/2 top-1/2 h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/12" style={{ animation: 'slow-spin 28s linear infinite' }} />
            <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-200/8" style={{ animation: 'slow-spin 52s linear infinite reverse' }} />

            <motion.div
              className="absolute left-1/2 top-1/2 grid h-64 w-64 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-teal-100/40 bg-gradient-to-br from-teal-200 via-cyan-200 to-indigo-300 shadow-[0_0_140px_rgba(94,234,212,.58)]"
              animate={{
                rotate: 360,
                boxShadow: [
                  '0 0 90px rgba(94,234,212,.42)',
                  '0 0 150px rgba(246,199,104,.35)',
                  '0 0 110px rgba(159,140,255,.42)',
                  '0 0 90px rgba(94,234,212,.42)',
                ],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            >
              <div className="grid h-40 w-40 place-items-center rounded-full border border-white/10 bg-[#05070c]/92 text-center shadow-inner">
                <div>
                  <div className="text-6xl font-black text-teal-100">OS</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-teal-100/52">Life Core</div>
                </div>
              </div>
            </motion.div>

            {subRealms.slice(0, 5).map((realm, index) => {
              const angle = (index / 5) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(angle) * 38;
              const y = 50 + Math.sin(angle) * 34;
              return (
                <motion.div
                  key={realm.name}
                  className="absolute w-36 rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-xl"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4 + index * 0.4, repeat: Infinity }}
                >
                  <div className="truncate text-xs text-white/70">{realm.name}</div>
                  <div className="mt-1 font-mono text-[10px] text-white/35">{realm.level}</div>
                  <div className="mt-2 h-1 overflow-hidden rounded bg-white/10">
                    <div className="h-full rounded" style={{ width: `${realm.progress}%`, backgroundColor: realm.color }} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="absolute bottom-8 left-8 right-8 z-10 grid grid-cols-3 gap-3">
            {[
              ['Trace', latestTrace?.traceId ?? 'mock trace'],
              ['Memory', `${state?.memories?.length ?? 2} entries`],
              ['Dreams', `${state?.dreams?.length ?? 0} reports`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/32">{label}</div>
                <div className="mt-1 truncate text-sm text-white/78">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-12 space-y-5 lg:col-span-5">
          <div className="glass-panel rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <Target size={18} className="text-teal-200" />
                今日修炼任务
              </div>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/45">{todayTasks.filter((task) => task.completed).length}/{todayTasks.length}</span>
            </div>
            <div className="space-y-3">
              {todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                    task.completed ? 'border-teal-200/18 bg-teal-200/8 text-white/62' : 'border-white/10 bg-white/[0.035] text-white/86'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${task.completed ? 'bg-teal-200' : 'bg-amber-200'}`} />
                  <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/80">
              <Flame size={18} className="text-rose-300" />
              当前心魔
            </div>
            <div className="space-y-4">
              {heartDemons.map((demon) => (
                <div key={demon.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-white/72">{demon.name}</span>
                    <span className="font-mono text-rose-200/80">{demon.intensity}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-200 to-rose-400" style={{ width: `${demon.intensity}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-7">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Waves size={18} className="text-amber-200" />
            近期突破
          </div>
          <div className="grid grid-cols-3 gap-4">
            {recentBreakthroughs.map((item, index) => (
              <div key={index} className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.055] p-5 text-sm leading-relaxed text-amber-50/82">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-5">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Activity size={18} className="text-indigo-200" />
            子境界进度
          </div>
          <div className="space-y-5">
            {subRealms.map((realm) => (
              <div key={realm.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-white/78">{realm.name}</span>
                  <span className="text-white/42">{realm.level}</span>
                </div>
                <Progress value={realm.progress} color={realm.color} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
