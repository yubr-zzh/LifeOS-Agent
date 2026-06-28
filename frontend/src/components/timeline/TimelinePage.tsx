import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, GitBranch, Radar, Sparkles } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { mockData } from '../../lib/mockData';
import { getLifeOSState, type LifeOSState } from '../../lib/api';

const TimelinePage = () => {
  const [state, setState] = useState<LifeOSState | null>(null);

  useEffect(() => {
    getLifeOSState()
      .then(setState)
      .catch((error) => {
        console.warn('LifeOS state unavailable, using timeline mock', error);
      });
  }, []);

  const liveTimeline = useMemo(() => {
    if (!state) return mockData.timeline;

    const logNodes = state.logs.slice(-4).map((log, index) => ({
      id: index + 1,
      date: log.date,
      title: '修炼日志入库',
      type: 'record' as const,
      description: log.summary || log.rawInput,
    }));

    const feedbackNodes = state.feedbacks.slice(-3).map((feedback, index) => ({
      id: 100 + index,
      date: feedback.timestamp.slice(0, 10),
      title: '用户反馈触发二次进化',
      type: 'heart_demon' as const,
      description: `${feedback.rating} / ${feedback.planFit}：${feedback.note ?? '无备注'}`,
    }));

    const dreamNodes = state.dreams.slice(-3).map((dream, index) => ({
      id: 200 + index,
      date: dream.timestamp.slice(0, 10),
      title: 'Dreaming 离线凝练',
      type: 'breakthrough' as const,
      description: dream.summary,
    }));

    const nodes = [...logNodes, ...feedbackNodes, ...dreamNodes];
    return nodes.length ? nodes : mockData.timeline;
  }, [state]);

  const liveRadarData = useMemo(() => {
    if (!state?.profile?.subRealms?.length) return mockData.radarData;
    return {
      dimensions: state.profile.subRealms.map((realm) => realm.name),
      values: state.profile.subRealms.map((realm) => realm.progress),
    };
  }, [state]);

  const radarOption = {
    radar: {
      indicator: liveRadarData.dimensions.map((name) => ({ name, max: 100 })),
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
            value: liveRadarData.values,
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

  return (
    <div className="h-screen overflow-auto p-8 pr-10 custom-scroll">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/20 bg-indigo-200/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-indigo-100/75">
            <GitBranch size={14} />
            Growth Trace
          </div>
          <h1 className="text-5xl font-black tracking-[-0.045em] text-white">成长轨迹</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/45">把日志、反馈、Dreaming 与境界变化压到同一条时间线上，展示 LifeOS 的伴随式长期记忆。</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/78">
            <Radar size={18} className="text-teal-200" />
            五维灵根雷达
          </div>
          <ReactECharts option={radarOption} style={{ height: 420 }} opts={{ renderer: 'svg' }} />
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/24 p-4 text-xs leading-relaxed text-white/42">子境界不是任务数量，而是稳定执行、复盘质量、项目推进、心魔改善和 Skill 熟练度的综合曲线。</div>
        </section>

        <section className="glass-panel col-span-12 rounded-[2rem] p-6 lg:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/78">
              <Clock3 size={18} className="text-amber-200" />
              命运长河
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">{liveTimeline.length} nodes</span>
          </div>

          <div className="relative space-y-7 before:absolute before:left-[1.4rem] before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/18 before:to-transparent">
            {liveTimeline.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="relative flex gap-5"
              >
                <div className={`z-10 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border bg-[#071019] ${
                  node.type === 'breakthrough'
                    ? 'border-amber-200/35 text-amber-200'
                    : node.type === 'heart_demon'
                      ? 'border-rose-200/35 text-rose-200'
                      : 'border-teal-200/30 text-teal-200'
                }`}>
                  <Sparkles size={18} />
                </div>
                <div className="flex-1 rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="font-mono text-xs text-white/35">{node.date}</span>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/38">
                      {node.type === 'breakthrough' ? '突破' : node.type === 'heart_demon' ? '反馈/心魔' : '记录'}
                    </span>
                  </div>
                  <div className="text-xl font-bold tracking-[-0.02em] text-white/92">{node.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-white/58">{node.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="glass-panel col-span-12 rounded-[2rem] p-6">
          <div className="mb-4 text-sm font-semibold text-white/78">心魔趋势</div>
          <ReactECharts
            option={{
              xAxis: {
                type: 'category',
                data: ['06.01', '06.05', '06.10', '06.15', '06.20', '06.25', '06.29'],
                axisLine: { lineStyle: { color: 'rgba(247,243,232,.16)' } },
                axisLabel: { color: 'rgba(247,243,232,.42)' },
              },
              yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                splitLine: { lineStyle: { color: 'rgba(247,243,232,.08)' } },
                axisLabel: { color: 'rgba(247,243,232,.42)' },
              },
              grid: { left: 34, right: 18, top: 20, bottom: 28 },
              series: [
                {
                  name: '焦虑',
                  type: 'line',
                  data: [42, 65, 33, 81, 54, 77, 61],
                  smooth: true,
                  lineStyle: { color: '#fb7185', width: 3 },
                  areaStyle: { color: 'rgba(251, 113, 133, 0.08)' },
                },
                {
                  name: '分心',
                  type: 'line',
                  data: [28, 55, 72, 41, 66, 39, 82],
                  smooth: true,
                  lineStyle: { color: '#f6c768', width: 3 },
                },
              ],
              tooltip: { trigger: 'axis' },
              backgroundColor: 'transparent',
            }}
            style={{ height: 260 }}
          />
        </section>
      </div>
    </div>
  );
};

export default TimelinePage;
