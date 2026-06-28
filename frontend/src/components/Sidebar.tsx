'use client';

import { Home, BookOpen, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: '洞府', icon: Home },
  { id: 'journal', label: '修炼日志', icon: BookOpen },
  { id: 'timeline', label: '成长轨迹', icon: TrendingUp },
  { id: 'harness', label: 'Harness 面板', icon: Zap },
];

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <div className="w-72 bg-black/70 backdrop-blur-2xl border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl">
      {/* Logo Header */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center shadow-[0_0_25px_-3px] shadow-violet-500">
            <span className="text-3xl">🌀</span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
              LIFEOS
            </div>
            <div className="text-[10px] text-white/40 -mt-1 font-mono">AGENT v0.8.4</div>
          </div>
        </div>
        <div className="mt-6 text-xs uppercase tracking-[3px] text-white/30 font-medium">修仙智能体</div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all group relative overflow-hidden
                ${isActive 
                  ? 'bg-white/10 shadow-[0_0_20px_-8px] shadow-violet-400' 
                  : 'hover:bg-white/5'
                }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent" />
              )}
              
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-violet-500 text-white' : 'text-white/60 group-hover:text-violet-300'}`}>
                <Icon size={22} />
              </div>
              
              <div>
                <div className={`font-medium ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                  {item.label}
                </div>
                <div className="text-[10px] text-white/30 font-mono">SECTION_{item.id.toUpperCase().slice(0,3)}</div>
              </div>
              
              {isActive && (
                <div className="absolute right-6 w-1.5 h-6 bg-violet-400 rounded-full animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 font-medium">灵脉已连通</span>
          </div>
          <div className="text-white/30 font-mono text-[10px]">06.29.26</div>
        </div>
        
        <div className="mt-8 text-[10px] text-center text-white/20 leading-relaxed">
          道生一<br />
          一生二<br />
          二生三<br />
          三生万物
        </div>
      </div>
    </div>
  );
}
