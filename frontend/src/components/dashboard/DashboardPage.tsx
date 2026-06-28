'use client';

import { motion } from 'framer-motion';
import { mockData } from '../../lib/mockData';
import { Progress } from './ProgressBar';

const DashboardPage = () => {
  const { cultivatorName, currentRealm, totalProgress, subRealms, todayTasks, heartDemons, recentBreakthroughs } = mockData;

  return (
    <div className="p-10 overflow-auto h-screen">
      {/* Top Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-4">
            <div className="text-6xl">🌌</div>
            <div>
              <div className="text-5xl font-bold tracking-tighter text-white">{cultivatorName}</div>
              <div className="flex items-center gap-3 mt-1">
                <div className="px-5 py-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-sm font-bold rounded-3xl inline-flex items-center gap-2 shadow-inner">
                  <span className="text-lg">⚔️</span>
                  {currentRealm}
                </div>
                <div className="text-white/40 text-sm font-mono">LV.17 • 灵根：天品</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-white/50 text-sm mb-2 font-medium">今日灵气汲取</div>
          <div className="flex items-center gap-4">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-violet-300">{totalProgress}</div>
            <div className="text-4xl text-white/30">%</div>
          </div>
          <div className="h-2.5 w-64 bg-white/10 rounded-full mt-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/40 animate-[shimmer_2s_infinite]"></div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Central Cave - Immersive Scene */}
        <div className="col-span-12 lg:col-span-7">
          <div className="relative h-[520px] rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a1f] shadow-2xl">
            {/* Background gradient + stars */}
            <div className="absolute inset-0 bg-[radial-gradient(at_center,#1a1a3a_0%,#05050f_70%)]"></div>
            
            {/* Floating particles / orbs */}
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_30px_#a5b4fc]"
                style={{
                  left: `${15 + i * 11}%`,
                  top: `${22 + (i % 3) * 18}%`,
                }}
                animate={{
                  y: [0, -80, 0],
                  opacity: [0.3, 0.9, 0.3],
                  scale: [0.6, 1.2, 0.6]
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}

            {/* Central Glowing Orb */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div 
                animate={{ 
                  rotate: 360,
                  boxShadow: ['0 0 80px 30px #67e8f9', '0 0 120px 50px #c026d3', '0 0 80px 30px #67e8f9']
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="w-56 h-56 rounded-full bg-gradient-to-br from-cyan-300 via-purple-400 to-violet-600 flex items-center justify-center relative"
              >
                <div className="w-36 h-36 bg-[#0a0a1f] rounded-full flex items-center justify-center">
                  <div className="text-[120px] drop-shadow-2xl">🌀</div>
                </div>
                
                {/* Inner pulsing rings */}
                <div className="absolute inset-0 border border-white/30 rounded-full animate-[ping_6s_infinite]"></div>
                <div className="absolute inset-[18px] border border-white/20 rounded-full animate-[ping_4s_infinite_300ms]"></div>
              </motion.div>
            </div>

            {/* Floating labels */}
            <div className="absolute top-12 left-12 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-cyan-400/30 text-cyan-200 text-sm font-medium flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
              灵气流动稳定
            </div>

            <div className="absolute bottom-16 right-12 bg-black/60 backdrop-blur-xl px-6 py-4 rounded-3xl border border-amber-400/30 text-amber-200 text-xs max-w-[200px]">
              <div className="font-mono mb-1 opacity-60">境界波动</div>
              <div className="text-lg font-semibold text-amber-300">+0.4 灵压</div>
            </div>

            {/* Cave title overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
              <div className="inline-block px-8 py-2 bg-black/70 text-white/90 text-sm tracking-widest border border-white/10 rounded-3xl font-serif">
                玄虚洞府
              </div>
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="uppercase text-xs tracking-widest text-white/50">今日修炼任务</div>
              <div className="text-emerald-400 text-xs font-medium">4 项 • 2 已完成</div>
            </div>
            
            <div className="space-y-4">
              {todayTasks.map((task, idx) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all border ${task.completed ? 'border-emerald-500/30 bg-emerald-900/20' : 'border-white/10 hover:border-white/30'}`}
                >
                  <div className={`w-6 h-6 rounded-xl flex-shrink-0 flex items-center justify-center border ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'}`}>
                    {task.completed && <span className="text-black text-xl leading-none mt-px">✓</span>}
                  </div>
                  <div className={`flex-1 text-sm ${task.completed ? 'line-through text-white/50' : 'text-white'}`}>
                    {task.title}
                  </div>
                  <div className="text-[10px] font-mono text-white/30">TASK_{String(idx+1).padStart(2,'0')}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Heart Demons */}
          <div className="bg-white/5 border border-red-500/20 rounded-3xl p-8">
            <div className="uppercase text-xs tracking-widest text-red-400 mb-6 flex items-center gap-2">
              <span>⚠︎</span> 当前心魔
            </div>
            
            <div className="space-y-5">
              {heartDemons.map((demon, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-red-400 text-xl">☁︎</div>
                  <div className="flex-1">
                    <div className="text-white text-sm mb-1.5">{demon.name}</div>
                    <div className="h-1 bg-white/10 rounded">
                      <div 
                        className="h-1 bg-gradient-to-r from-red-400 to-rose-600 rounded transition-all" 
                        style={{ width: `${demon.intensity}%` }}
                      />
                    </div>
                  </div>
                  <div className="font-mono text-xs text-red-400/70 w-8 text-right">{demon.intensity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Breakthroughs + Subrealms */}
        <div className="col-span-12 lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-lg font-medium text-amber-300">近期突破</div>
              <div className="text-white/40 text-sm">过去 7 日灵感闪现</div>
            </div>
            <div className="text-xs bg-amber-400/10 text-amber-400 px-4 py-1 rounded-3xl">+3 突破</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {recentBreakthroughs.map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.03 }}
                className="bg-black/60 border border-amber-400/30 rounded-2xl p-6 text-sm leading-snug text-amber-100/90 h-full flex items-center"
              >
                ✨ {item}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sub Realms Progress */}
        <div className="col-span-12 lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="uppercase text-xs tracking-[1px] text-violet-300 mb-7">子境界进展</div>
          
          <div className="space-y-8">
            {subRealms.map((realm, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-3">
                  <div className="text-white">{realm.name}</div>
                  <div className="font-medium text-emerald-400">{realm.level}</div>
                </div>
                <Progress value={realm.progress} color={realm.color} />
                <div className="text-right text-[10px] text-white/30 mt-1 font-mono">{realm.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
