import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AudioLines,
  Box,
  ChevronDown,
  Cloud,
  Flame,
  Folder,
  Network,
  Sparkles,
  Star,
  Target,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { getLifeOSState, type LifeOSState } from '../../lib/api';
import { Progress } from './ProgressBar';

const DashboardPage = () => {
  const [state, setState] = useState<LifeOSState | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

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
  const completedTasks = todayTasks.filter((task) => task.completed).length;

  const togglePanel = (panel: string) => {
    setExpandedPanel((current) => (current === panel ? null : panel));
  };

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
        <section className="glass-panel relative col-span-12 min-h-[560px] overflow-hidden rounded-[2rem] p-8 lg:col-span-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(94,234,212,.2),transparent_30%),radial-gradient(circle_at_58%_50%,rgba(167,139,250,.18),transparent_40%),radial-gradient(circle_at_46%_58%,rgba(96,165,250,.13),transparent_34%)]" />
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(94,234,212,.075)_1px,transparent_1px),linear-gradient(90deg,rgba(94,234,212,.075)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute left-8 top-8 z-10 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs text-white/50 backdrop-blur-xl">动态洞府灵核</div>

          <div className="absolute inset-x-12 bottom-20 top-16">
            <LifeCoreOrbit />
          </div>

          <div className="absolute bottom-3 left-12 right-12 z-10 grid grid-cols-3 gap-2">
            {[
              ['Trace', latestTrace?.traceId ?? 'mock trace'],
              ['Memory', `${state?.memories?.length ?? 2} entries`],
              ['Dreams', `${state?.dreams?.length ?? 0} reports`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-black/28 px-3 py-2 backdrop-blur-xl">
                <div className="text-[9px] uppercase tracking-[0.2em] text-white/28">{label}</div>
                <div className="mt-0.5 truncate text-xs text-white/66">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-12 space-y-3 lg:col-span-5">
          <CompactPanel
            title="今日修炼任务"
            icon={Target}
            badge={`${completedTasks}/${todayTasks.length}`}
            summary={todayTasks.find((task) => !task.completed)?.title ?? todayTasks[0]?.title ?? '今日暂无任务'}
            expanded={expandedPanel === 'tasks'}
            onToggle={() => togglePanel('tasks')}
          >
            <div className="space-y-3">
              {todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.045 }}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
                    task.completed ? 'border-teal-200/18 bg-teal-200/8 text-white/62' : 'border-white/10 bg-white/[0.035] text-white/86'
                  }`}
                >
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${task.completed ? 'bg-teal-200' : 'bg-amber-200'}`} />
                  <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                </motion.div>
              ))}
            </div>
          </CompactPanel>

          <CompactPanel
            title="当前心魔"
            icon={Flame}
            badge={`${heartDemons[0]?.intensity ?? 0}`}
            summary={heartDemons.slice(0, 3).map((demon) => `${demon.name} ${demon.intensity}`).join(' / ')}
            expanded={expandedPanel === 'demons'}
            onToggle={() => togglePanel('demons')}
          >
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
          </CompactPanel>

          <CompactPanel
            title="近期突破"
            icon={Waves}
            badge={`${recentBreakthroughs.length}`}
            summary={recentBreakthroughs[0] ?? '等待下一次突破记录'}
            expanded={expandedPanel === 'breakthroughs'}
            onToggle={() => togglePanel('breakthroughs')}
          >
            <div className="grid gap-3">
              {recentBreakthroughs.map((item, index) => (
                <div key={index} className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.055] p-4 text-sm leading-relaxed text-amber-50/82">
                  {item}
                </div>
              ))}
            </div>
          </CompactPanel>

          <CompactPanel
            title="子境界进度"
            icon={Activity}
            badge={`${subRealms.length}`}
            summary={subRealms.slice(0, 3).map((realm) => `${realm.name} ${realm.level}`).join(' / ')}
            expanded={expandedPanel === 'realms'}
            onToggle={() => togglePanel('realms')}
          >
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
          </CompactPanel>
        </section>
      </div>
    </div>
  );
};

const CompactPanel = ({
  title,
  icon: Icon,
  badge,
  summary,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: LucideIcon;
  badge: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) => (
  <div className="glass-panel overflow-hidden rounded-[1.55rem]">
    <button onClick={onToggle} className="flex w-full items-center gap-4 px-5 py-4 text-left">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/20">
        <Icon size={18} className="text-teal-100" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <div className="shrink-0 text-sm font-semibold text-white/82">{title}</div>
          <div className="truncate text-xs text-white/42">{summary}</div>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-white/8 px-3 py-1 text-xs text-white/45">{badge}</span>
      <ChevronDown size={16} className={`shrink-0 text-white/42 transition ${expanded ? 'rotate-180' : ''}`} />
    </button>

    {expanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        className="border-t border-white/10 px-5 pb-5 pt-4"
      >
        {children}
      </motion.div>
    )}
  </div>
);

const orbitModules: Array<{
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  angle: number;
  color: string;
  glow: string;
}> = [
  { id: 'memory', label: 'Memory', hint: '结构化存储与回溯', icon: Box, angle: -90, color: '#5eead4', glow: 'rgba(94,234,212,.55)' },
  { id: 'skills', label: 'Skills', hint: '持续学习与构建', icon: Star, angle: -6, color: '#a78bfa', glow: 'rgba(167,139,250,.58)' },
  { id: 'dreaming', label: 'Dreaming', hint: '想象推演与未来模拟', icon: Cloud, angle: 58, color: '#60a5fa', glow: 'rgba(96,165,250,.56)' },
  { id: 'harness', label: 'Harness', hint: '调度工具与行动落地', icon: Network, angle: 132, color: '#a78bfa', glow: 'rgba(167,139,250,.5)' },
  { id: 'filesystem', label: 'File-system', hint: '统一管理与输出', icon: Folder, angle: 205, color: '#5eead4', glow: 'rgba(94,234,212,.5)' },
];

const LifeCoreOrbit = () => (
  <div className="life-core-stage">
    <div className="life-core-orbit orbit-outer" />
    <div className="life-core-orbit orbit-main" />
    <div className="life-core-orbit orbit-inner" />

    {Array.from({ length: 34 }).map((_, index) => {
      const angle = (index / 34) * Math.PI * 2;
      const radius = 150 + (index % 5) * 19;
      return (
        <motion.span
          key={`life-core-particle-${index}`}
          className="life-core-particle"
          style={{
            x: `${Math.cos(angle) * radius}px`,
            y: `${Math.sin(angle) * radius * 0.78}px`,
          }}
          animate={{ opacity: [0.18, 0.88, 0.18], scale: [0.55, 1.25, 0.55] }}
          transition={{ duration: 2.6 + (index % 6) * 0.32, repeat: Infinity, delay: index * 0.055 }}
        />
      );
    })}

    <motion.div
      className="life-core-center"
      animate={{ y: [0, -10, 0], scale: [1, 1.025, 1] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.08 }}
    >
      <div className="life-core-drop">
        <AudioLines size={46} strokeWidth={2.2} />
      </div>
    </motion.div>

    <div className="life-core-node-layer">
      {orbitModules.map((mod) => {
        const Icon = mod.icon;
        return (
          <motion.button
            key={mod.id}
            type="button"
            className="life-core-node group"
            style={
              {
                '--angle': `${mod.angle}deg`,
                '--counter-angle': `${-mod.angle}deg`,
                '--node-color': mod.color,
                '--node-glow': mod.glow,
              } as CSSProperties
            }
            whileHover={{ scale: 1.16, zIndex: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <span className="life-core-node-icon">
              <Icon size={28} strokeWidth={2.1} />
            </span>
            <span className="life-core-tooltip">
              <span>{mod.label}</span>
              <small>{mod.hint}</small>
            </span>
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default DashboardPage;
