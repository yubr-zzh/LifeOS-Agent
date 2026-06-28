'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { mockData } from '../../lib/mockData';
import { getLifeOSState, type LifeOSState } from '../../lib/api';
import ReactECharts from 'echarts-for-react';

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

  const timeline = liveTimeline;
  const radarData = liveRadarData;

  const radarOption = {
    radar: {
      indicator: radarData.dimensions.map((name) => ({
        name,
        max: 100,
      })),
      splitNumber: 4,
      axisName: {
        color: '#a1a1aa',
        fontSize: 13,
      },
      splitLine: {
        lineStyle: { color: '#27272a' }
      },
      axisLine: {
        lineStyle: { color: '#3f3f46' }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: radarData.values,
        name: '当前境界',
        areaStyle: {
          color: 'rgba(167, 139, 250, 0.25)'
        },
        lineStyle: {
          color: '#a78bfa',
          width: 3
        },
        symbolSize: 6,
        itemStyle: {
          color: '#c4b5fd'
        }
      }]
    }],
    backgroundColor: 'transparent',
  };

  const getTypeColor = (type: string) => {
    if (type === 'breakthrough') return 'text-amber-400 border-amber-400';
    if (type === 'heart_demon') return 'text-red-400 border-red-400';
    return 'text-sky-400 border-sky-400';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'breakthrough') return '✧';
    if (type === 'heart_demon') return '☠';
    return '◉';
  };

  return (
    <div className="p-10 space-y-12">
      <div>
        <div className="text-xs uppercase text-violet-300 mb-1 tracking-widest">灵根全景</div>
        <h1 className="text-5xl font-bold text-white tracking-tighter">成长轨迹 • 命运长河</h1>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Radar Chart */}
        <div className="col-span-12 lg:col-span-5 bg-zinc-950 border border-white/10 rounded-3xl p-10">
          <div className="mb-8 text-white/70">五维灵根雷达图</div>
          <ReactECharts 
            option={radarOption} 
            style={{ height: '420px' }}
            opts={{ renderer: 'svg' }}
          />
          <div className="text-center text-xs text-white/30 mt-4">数值越高代表越接近金丹境界</div>
        </div>

        {/* Timeline */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-10">
            <div className="uppercase tracking-widest text-xs mb-8 text-white/60">命运长河 • TIME RIVER</div>
            
            <div className="space-y-12 relative before:absolute before:left-8 before:top-6 before:bottom-6 before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
              {timeline.map((node, index) => (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-8 pl-4"
                >
                  <div className={`w-16 h-16 flex-shrink-0 border-2 rounded-2xl flex items-center justify-center text-3xl z-10 bg-zinc-950 ${getTypeColor(node.type)}`}>
                    {getTypeIcon(node.type)}
                  </div>
                  
                  <div className="flex-1 pt-3">
                    <div className="flex items-baseline gap-4">
                      <div className="font-mono text-white/40 text-sm">{node.date}</div>
                      <div className={`uppercase text-xs px-4 py-px rounded-full border ${getTypeColor(node.type)}`}>
                        {node.type === 'breakthrough' ? '突破' : node.type === 'heart_demon' ? '心魔' : '记录'}
                      </div>
                    </div>
                    
                    <div className="text-2xl font-semibold text-white mt-2 tracking-tight">{node.title}</div>
                    <div className="mt-3 text-white/70 leading-relaxed max-w-prose">
                      {node.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heart Demon Trend Line */}
      <div className="bg-zinc-950 border border-white/10 rounded-3xl p-10">
        <div className="flex justify-between mb-8">
          <div>
            <div className="text-white/70">心魔趋势</div>
            <div className="text-sm text-white/40">近30日心魔强度波动</div>
          </div>
          <div className="text-xs bg-white/5 px-5 py-2 rounded-3xl self-start text-white/50">拖延 • 焦虑 • 分心</div>
        </div>
        
        <ReactECharts
          option={{
            xAxis: {
              type: 'category',
              data: ['06.01', '06.05', '06.10', '06.15', '06.20', '06.25', '06.29'],
              axisLine: { lineStyle: { color: '#3f3f46' } },
              axisLabel: { color: '#71717a' }
            },
            yAxis: {
              type: 'value',
              min: 0,
              max: 100,
              axisLine: { lineStyle: { color: '#3f3f46' } },
              axisLabel: { color: '#71717a' }
            },
            grid: {
              left: 30,
              right: 30,
              top: 30,
              bottom: 30
            },
            series: [
              {
                name: '焦虑',
                type: 'line',
                data: [42, 65, 33, 81, 54, 77, 61],
                smooth: true,
                lineStyle: { color: '#f43f5e' },
                areaStyle: { color: 'rgba(244, 63, 94, 0.1)' }
              },
              {
                name: '分心',
                type: 'line',
                data: [28, 55, 72, 41, 66, 39, 82],
                smooth: true,
                lineStyle: { color: '#eab308' },
              }
            ],
            tooltip: { trigger: 'axis' },
            backgroundColor: 'transparent',
          }}
          style={{ height: 260 }}
        />
      </div>
    </div>
  );
};

export default TimelinePage;
