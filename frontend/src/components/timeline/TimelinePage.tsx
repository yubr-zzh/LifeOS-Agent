import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock3, FolderTree, GitBranch, Layers3, LineChart, Lock, Plus, Radar, Sparkles } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { mockData } from '../../lib/mockData';
import { getLifeOSState, type LifeOSState } from '../../lib/api';

type TimelineMode = 'overview' | 'river' | 'radar';

const rootColors = ['#5eead4', '#9f8cff', '#60a5fa', '#f6c768', '#fb7185', '#34d399'];

const subRadarPresets: Record<string, { dimensions: string[]; values: number[] }> = {
  技术深度: { dimensions: ['论文输入', '源码阅读', '工程抽象', '复现能力', '输出质量', '调试韧性'], values: [72, 68, 78, 61, 74, 66] },
  项目推进: { dimensions: ['需求拆解', 'MVP 交付', '迭代速度', '展示质量', '风险收束'], values: [82, 76, 70, 86, 64] },
  学习稳定: { dimensions: ['晨间启动', '专注时长', '复盘连续', '任务粒度', '抗打断'], values: [62, 74, 68, 80, 58] },
  心魔控制: { dimensions: ['焦虑识别', '分心复位', '目标降维', '睡眠修复', '情绪记录'], values: [58, 54, 76, 49, 72] },
  规划能力: { dimensions: ['目标清晰', '优先级', '时间估算', '缓冲设计', '反馈调整'], values: [78, 74, 63, 69, 82] },
};

const TimelinePage = () => {
  const [state, setState] = useState<LifeOSState | null>(null);
  const [mode, setMode] = useState<TimelineMode>('overview');
  const [activeRealm, setActiveRealm] = useState(0);
  const [selectedRoots, setSelectedRoots] = useState<string[]>(['技术深度', '项目推进', '学习稳定', '规划能力', '心魔控制']);

  useEffect(() => {
    getLifeOSState()
      .then(setState)
      .catch((error) => {
        console.warn('LifeOS state unavailable, using timeline mock', error);
      });
  }, []);

  const liveTimeline = useMemo(() => {
    if (!state) return mockData.timeline;

    const logNodes = state.logs.slice(-5).map((log, index) => ({
      id: index + 1,
      date: log.date,
      title: '修炼日志入库',
      type: 'record' as const,
      description: log.summary || log.rawInput,
    }));

    const feedbackNodes = state.feedbacks.slice(-4).map((feedback, index) => ({
      id: 100 + index,
      date: feedback.timestamp.slice(0, 10),
      title: '反馈触发二次进化',
      type: 'heart_demon' as const,
      description: `${feedback.rating} / ${feedback.planFit}：${feedback.note ?? '无备注'}`,
    }));

    const dreamNodes = state.dreams.slice(-4).map((dream, index) => ({
      id: 200 + index,
      date: dream.timestamp.slice(0, 10),
      title: 'Dreaming 离线凝练',
      type: 'breakthrough' as const,
      description: dream.summary,
    }));

    const nodes = [...logNodes, ...feedbackNodes, ...dreamNodes].sort((a, b) => a.date.localeCompare(b.date));
    return nodes.length ? nodes : mockData.timeline;
  }, [state]);

  const liveRadarData = useMemo(() => {
    if (!state?.profile?.subRealms?.length) return mockData.radarData;
    return {
      dimensions: state.profile.subRealms.map((realm) => realm.name),
      values: state.profile.subRealms.map((realm) => realm.progress),
    };
  }, [state]);

  const rootOptions = liveRadarData.dimensions.map((name, index) => ({
    name,
    value: liveRadarData.values[index] ?? 50,
    color: rootColors[index % rootColors.length],
  }));
  const selectedRootOptions = rootOptions.filter((item) => selectedRoots.includes(item.name));
  const activeRootOptions = selectedRootOptions.length >= 3 ? selectedRootOptions : rootOptions.slice(0, Math.min(5, rootOptions.length));
  const radarOption = buildRadarOption(activeRootOptions.map((item) => item.name), activeRootOptions.map((item) => item.value));
  const activeDimension = liveRadarData.dimensions[activeRealm] ?? liveRadarData.dimensions[0];
  const activeSubRadar = subRadarPresets[activeDimension] ?? {
    dimensions: ['输入质量', '稳定执行', '复盘深度', '项目贡献', '抗干扰'],
    values: [72, 66, 81, liveRadarData.values[activeRealm] ?? 70, 58],
  };
  const previewNodes = liveTimeline.slice(-3).reverse();

  const toggleRoot = (name: string) => {
    setSelectedRoots((current) => {
      if (current.includes(name)) {
        return current.length <= 3 ? current : current.filter((item) => item !== name);
      }
      return current.length >= 6 ? [...current.slice(1), name] : [...current, name];
    });
  };

  return (
    <div className="h-screen overflow-auto p-8 pr-10 custom-scroll">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/20 bg-indigo-200/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-indigo-100/75">
            <GitBranch size={14} />
            Growth Trace
          </div>
          <h1 className="text-5xl font-black tracking-[-0.045em] text-white">成长轨迹</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/45">
            把日志、反馈、Dreaming 与境界变化压缩成可浏览的长期记忆。默认展示摘要，进入模块后再看完整视觉分析。
          </p>
        </div>
        {mode !== 'overview' && (
          <button
            onClick={() => setMode('overview')}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/68 transition hover:border-teal-200/25 hover:text-white"
          >
            <ArrowLeft size={17} />
            返回总览
          </button>
        )}
      </div>

      {mode === 'overview' && (
        <div className="grid grid-cols-12 gap-5">
          <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/78">
                <Radar size={18} className="text-teal-200" />
                灵根组合工坊
              </div>
              <button onClick={() => setMode('radar')} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/50 hover:text-white">
                进入灵根目录
              </button>
            </div>
            <div className="grid grid-cols-[1fr_140px] gap-4">
              <ReactECharts option={radarOption} style={{ height: 260 }} opts={{ renderer: 'svg' }} />
              <div className="space-y-2">
                {rootOptions.slice(0, 6).map((root) => {
                  const active = activeRootOptions.some((item) => item.name === root.name);
                  return (
                    <button
                      key={root.name}
                      onClick={() => toggleRoot(root.name)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition ${
                        active ? 'border-teal-200/25 bg-teal-200/[0.08] text-teal-50' : 'border-white/10 bg-white/[0.025] text-white/42 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{root.name}</span>
                      {active ? <CheckCircle2 size={13} /> : <Plus size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-teal-200/14 bg-teal-200/[0.045] p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-teal-50/80">
                  <Layers3 size={14} />
                  当前组合
                </div>
                <div className="line-clamp-2 text-xs leading-relaxed text-white/45">{activeRootOptions.map((item) => item.name).join(' / ')}</div>
              </div>
              <div className="rounded-2xl border border-amber-200/14 bg-amber-200/[0.045] p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-amber-50/80">
                  <Lock size={14} />
                  周锁约束
                </div>
                <div className="text-xs leading-relaxed text-white/45">每周只允许调整一次，避免情绪化频繁改盘。</div>
              </div>
            </div>
          </section>

          <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-7">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/78">
                <Clock3 size={18} className="text-amber-200" />
                命运长河
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                {liveTimeline.length} nodes
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {previewNodes.map((node, index) => (
                <RiverPreview key={node.id} node={node} index={index} />
              ))}
            </div>
            <button
              onClick={() => setMode('river')}
              className="mt-5 w-full rounded-2xl border border-amber-200/18 bg-amber-200/[0.055] px-5 py-4 text-sm font-semibold text-amber-50/82 transition hover:bg-amber-200/10"
            >
              展开更多，进入命运长河
            </button>
          </section>

          <section className="glass-panel col-span-12 rounded-[2rem] p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/78">
              <LineChart size={18} className="text-indigo-200" />
              趋势图谱
            </div>
            <div className="grid grid-cols-2 gap-5">
              <TrendChart title="心魔趋势" seriesNameA="焦虑" seriesNameB="分心" colorA="#fb7185" colorB="#f6c768" />
              <TrendChart title="修为增长" seriesNameA="总境界" seriesNameB="项目实战" colorA="#5eead4" colorB="#9f8cff" growth />
            </div>
          </section>
        </div>
      )}

      {mode === 'river' && (
        <section className="relative overflow-hidden rounded-[2rem] border border-violet-200/14 bg-[radial-gradient(circle_at_30%_10%,rgba(96,165,250,.18),transparent_28%),radial-gradient(circle_at_72%_24%,rgba(167,139,250,.22),transparent_30%),linear-gradient(135deg,rgba(6,10,28,.94),rgba(12,13,42,.9)_50%,rgba(3,7,18,.96))] p-7 shadow-[0_28px_90px_rgba(4,7,18,.42)]">
          <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(167,139,250,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(94,234,212,.06)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="relative z-10 mb-7 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white/80">命运长河全景</div>
              <div className="mt-1 text-xs text-white/38">日志、反馈与 Dreaming 以瀑布流形式沉淀为长期记忆。</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
              alternating river
            </span>
          </div>
          <div className="relative z-10 mx-auto max-w-5xl pb-4">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-teal-200/35 to-transparent" />
            {liveTimeline.slice().reverse().map((node, index) => (
              <RiverCard key={node.id} node={node} index={index} alternating />
            ))}
          </div>
        </section>
      )}

      {mode === 'radar' && (
        <section className="grid grid-cols-12 gap-5">
          <div className="glass-panel col-span-12 rounded-[2rem] p-7 lg:col-span-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white/80">灵根目录 / 根雷达组合</div>
                <div className="mt-1 text-xs text-white/38">根雷达是根目录，子雷达是子目录；组合可配置，但每周只允许调整一次。</div>
              </div>
              <span className="gold-chip rounded-full px-4 py-2 text-xs font-bold">本周已锁定</span>
            </div>
            <ReactECharts option={radarOption} style={{ height: 440 }} opts={{ renderer: 'svg' }} />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {rootOptions.map((root, index) => (
                <button
                  key={root.name}
                  onClick={() => {
                    setActiveRealm(index);
                    toggleRoot(root.name);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    activeRootOptions.some((item) => item.name === root.name)
                      ? 'border-teal-200/30 bg-teal-200/[0.09] text-teal-50'
                      : 'border-white/10 bg-white/[0.035] text-white/58 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{root.name}</span>
                    {activeRootOptions.some((item) => item.name === root.name) ? <CheckCircle2 size={15} /> : <Plus size={15} />}
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded bg-white/10">
                    <div className="h-full rounded" style={{ width: `${root.value}%`, backgroundColor: root.color }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="glass-panel col-span-12 rounded-[2rem] p-7 lg:col-span-5">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/80">
              <FolderTree size={18} className="text-amber-200" />
              {activeDimension} / 子雷达目录
            </div>
            <ReactECharts
              option={buildRadarOption(activeSubRadar.dimensions, activeSubRadar.values)}
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {activeSubRadar.dimensions.map((dimension, index) => (
                <div key={dimension} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="truncate text-xs font-semibold text-white/70">{dimension}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded bg-white/10">
                      <div className="h-full rounded bg-gradient-to-r from-teal-200 to-violet-300" style={{ width: `${activeSubRadar.values[index]}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-white/38">{activeSubRadar.values[index]}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-amber-200/14 bg-amber-200/[0.045] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-50/80">
                <FolderTree size={14} />
                文件系统范式
              </div>
              <div className="space-y-2 font-mono text-[11px] text-white/45">
                <div>/root/{activeDimension}/README.md</div>
                <div>/root/{activeDimension}/subradar.json</div>
                <div>/root/{activeDimension}/weekly-lock.yaml</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const RiverPreview = ({ node, index }: { node: ReturnType<typeof mockData.timeline.slice>[number]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    className="min-h-[160px] rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5"
  >
    <div className="mb-3 flex items-center justify-between">
      <span className="font-mono text-xs text-white/35">{node.date}</span>
      <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/38">{node.type}</span>
    </div>
    <div className="text-lg font-bold tracking-[-0.02em] text-white/92">{node.title}</div>
    <div className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/55">{node.description}</div>
  </motion.div>
);

const RiverCard = ({ node, index, alternating = false }: { node: ReturnType<typeof mockData.timeline.slice>[number]; index: number; alternating?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.035 }}
    className={`${alternating ? `relative mb-8 flex w-full ${index % 2 === 0 ? 'justify-start pr-[52%]' : 'justify-end pl-[52%]'}` : 'mb-5 break-inside-avoid'}`}
  >
    {alternating && (
      <div className="absolute left-1/2 top-8 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-teal-200 shadow-[0_0_24px_rgba(94,234,212,.9)]" />
    )}
    <div className="w-full rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_70px_rgba(0,0,0,.22)] backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl border ${
          node.type === 'breakthrough'
            ? 'border-amber-200/35 text-amber-200'
            : node.type === 'heart_demon'
              ? 'border-rose-200/35 text-rose-200'
              : 'border-teal-200/30 text-teal-200'
        }`}>
          <Sparkles size={17} />
        </div>
        <div>
          <div className="font-mono text-xs text-white/35">{node.date}</div>
          <div className="text-xs uppercase tracking-[0.16em] text-white/30">{node.type}</div>
        </div>
      </div>
      <div className="text-xl font-bold tracking-[-0.02em] text-white/92">{node.title}</div>
      <div className="mt-3 text-sm leading-relaxed text-white/58">{node.description}</div>
    </div>
  </motion.div>
);

const TrendChart = ({
  title,
  seriesNameA,
  seriesNameB,
  colorA,
  colorB,
  growth = false,
}: {
  title: string;
  seriesNameA: string;
  seriesNameB: string;
  colorA: string;
  colorB: string;
  growth?: boolean;
}) => (
  <div className="rounded-[1.5rem] border border-white/10 bg-black/16 p-5">
    <div className="mb-3 flex items-center justify-between">
      <div className="text-sm font-semibold text-white/76">{title}</div>
      <div className="flex gap-3 text-[11px] text-white/45">
        <span style={{ color: colorA }}>{seriesNameA}</span>
        <span style={{ color: colorB }}>{seriesNameB}</span>
      </div>
    </div>
    <ReactECharts
      option={{
        legend: { show: false },
        xAxis: {
          type: 'category',
          name: '日期',
          data: ['06.01', '06.05', '06.10', '06.15', '06.20', '06.25', '06.29'],
          axisLine: { lineStyle: { color: 'rgba(247,243,232,.16)' } },
          axisLabel: { color: 'rgba(247,243,232,.42)' },
          nameTextStyle: { color: 'rgba(247,243,232,.42)' },
        },
        yAxis: {
          type: 'value',
          name: growth ? '进度 %' : '强度',
          min: 0,
          max: 100,
          splitLine: { lineStyle: { color: 'rgba(247,243,232,.08)' } },
          axisLabel: { color: 'rgba(247,243,232,.42)' },
          nameTextStyle: { color: 'rgba(247,243,232,.42)' },
        },
        grid: { left: 42, right: 18, top: 34, bottom: 34 },
        series: [
          {
            name: seriesNameA,
            type: 'line',
            data: growth ? [45, 52, 61, 67, 74, 82, 88] : [42, 65, 33, 81, 54, 77, 61],
            smooth: true,
            lineStyle: { color: colorA, width: 3 },
            areaStyle: { color: `${colorA}18` },
            symbolSize: 7,
          },
          {
            name: seriesNameB,
            type: 'line',
            data: growth ? [32, 41, 48, 56, 64, 75, 84] : [28, 55, 72, 41, 66, 39, 82],
            smooth: true,
            lineStyle: { color: colorB, width: 3 },
            symbolSize: 7,
          },
        ],
        tooltip: { trigger: 'axis' },
        backgroundColor: 'transparent',
      }}
      style={{ height: 260 }}
    />
  </div>
);

function buildRadarOption(dimensions: string[], values: number[]) {
  return {
    radar: {
      indicator: dimensions.map((name) => ({ name, max: 100 })),
      splitNumber: 4,
      axisName: { color: 'rgba(247,243,232,.58)', fontSize: 12 },
      splitLine: { lineStyle: { color: 'rgba(247,243,232,.12)' } },
      axisLine: { lineStyle: { color: 'rgba(247,243,232,.14)' } },
      splitArea: { areaStyle: { color: ['rgba(255,255,255,.015)', 'rgba(255,255,255,.035)'] } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: values,
            name: '当前境界',
            areaStyle: { color: 'rgba(94, 234, 212, 0.18)' },
            lineStyle: { color: '#5eead4', width: 3 },
            symbolSize: 6,
            itemStyle: { color: '#f6c768' },
          },
        ],
      },
    ],
    backgroundColor: 'transparent',
  };
}

export default TimelinePage;
