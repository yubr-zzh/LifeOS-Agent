import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock3, FolderTree, GitBranch, LineChart, Radar, Sparkles } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { mockData } from '../../lib/mockData';
import { getLifeOSState, type LifeOSState } from '../../lib/api';

type TimelineMode = 'overview' | 'river' | 'radar';

const TimelinePage = () => {
  const [state, setState] = useState<LifeOSState | null>(null);
  const [mode, setMode] = useState<TimelineMode>('overview');
  const [activeRealm, setActiveRealm] = useState(0);

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

  const radarOption = buildRadarOption(liveRadarData.dimensions, liveRadarData.values);
  const activeDimension = liveRadarData.dimensions[activeRealm] ?? liveRadarData.dimensions[0];
  const previewNodes = liveTimeline.slice(-3).reverse();

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
                五维灵根雷达
              </div>
              <button onClick={() => setMode('radar')} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/50 hover:text-white">
                进入灵根目录
              </button>
            </div>
            <ReactECharts option={radarOption} style={{ height: 340 }} opts={{ renderer: 'svg' }} />
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/24 p-4 text-xs leading-relaxed text-white/42">
              根雷达对应根目录，子雷达对应子目录。灵根组合可配置，但每周只允许调整一次，避免把成长系统变成即时情绪化调参。
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
        <section className="glass-panel rounded-[2rem] p-7">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white/80">命运长河全景</div>
              <div className="mt-1 text-xs text-white/38">日志、反馈与 Dreaming 以瀑布流形式沉淀为长期记忆。</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
              waterfall memory
            </span>
          </div>
          <div className="columns-1 gap-5 lg:columns-2 2xl:columns-3">
            {liveTimeline.slice().reverse().map((node, index) => (
              <RiverCard key={node.id} node={node} index={index} />
            ))}
          </div>
        </section>
      )}

      {mode === 'radar' && (
        <section className="grid grid-cols-12 gap-5">
          <div className="glass-panel col-span-12 rounded-[2rem] p-7 lg:col-span-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white/80">灵根目录 / 根雷达</div>
                <div className="mt-1 text-xs text-white/38">点击维度查看子目录雷达；灵根组合每周只允许调整一次。</div>
              </div>
              <span className="gold-chip rounded-full px-4 py-2 text-xs font-bold">本周已锁定</span>
            </div>
            <ReactECharts option={radarOption} style={{ height: 440 }} opts={{ renderer: 'svg' }} />
            <div className="grid grid-cols-3 gap-3">
              {liveRadarData.dimensions.map((dimension, index) => (
                <button
                  key={dimension}
                  onClick={() => setActiveRealm(index)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    activeRealm === index ? 'border-teal-200/30 bg-teal-200/[0.09] text-teal-50' : 'border-white/10 bg-white/[0.035] text-white/58 hover:text-white'
                  }`}
                >
                  {dimension}
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
              option={buildRadarOption(['输入质量', '稳定执行', '复盘深度', '项目贡献', '抗干扰'], [72, 66, 81, liveRadarData.values[activeRealm] ?? 70, 58])}
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
            <div className="mt-5 space-y-3">
              {['README.md', 'trace.json', 'memory.md', 'weekly-lock.yaml'].map((file) => (
                <div key={file} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-xs text-white/50">
                  /root/{activeDimension}/{file}
                </div>
              ))}
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

const RiverCard = ({ node, index }: { node: ReturnType<typeof mockData.timeline.slice>[number]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.035 }}
    className="mb-5 break-inside-avoid rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-5"
  >
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
