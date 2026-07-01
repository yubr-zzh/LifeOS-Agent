import { BookOpen, BrainCircuit, Home, LineChart, MoonStar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: '洞府总览', hint: 'Realm OS', icon: Home },
  { id: 'journal', label: '修炼日志', hint: 'Daily Loop', icon: BookOpen },
  { id: 'timeline', label: '成长轨迹', hint: 'Time River', icon: LineChart },
  { id: 'dreaming', label: 'Dreaming', hint: 'Autonomous', icon: MoonStar },
  { id: 'harness', label: 'Harness 面板', hint: 'Agent Core', icon: Zap },
];

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="lifeos-sidebar fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-white/10 bg-[#05070c]/88 px-5 py-6 shadow-[18px_0_80px_rgba(0,0,0,.38)] backdrop-blur-2xl">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5">
        <div className="flex items-center gap-4">
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-teal-200/30 bg-teal-300/10 jade-glow">
            <BrainCircuit className="h-7 w-7 text-teal-200" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,.8)]" />
          </div>
          <div>
            <div className="text-[2rem] font-black leading-none tracking-[-0.04em]">LifeOS</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-teal-200/70">伴随式自进化 Agent</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-[0.16em] text-white/45">
          <div className="rounded-xl border border-white/10 bg-black/25 py-2">Memory</div>
          <div className="rounded-xl border border-white/10 bg-black/25 py-2">Skills</div>
          <div className="rounded-xl border border-white/10 bg-black/25 py-2">Dreaming</div>
        </div>
      </div>

      <nav className="mt-7 flex-1 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.045 }}
              onClick={() => onPageChange(item.id)}
              className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border px-4 py-4 text-left transition ${
                isActive
                  ? 'border-teal-200/25 bg-teal-200/[0.09] text-white shadow-[0_0_32px_rgba(94,234,212,.12)]'
                  : 'border-transparent text-white/64 hover:border-white/10 hover:bg-white/[0.045] hover:text-white'
              }`}
            >
              {isActive && <div className="absolute inset-y-2 left-0 w-1 rounded-full bg-teal-200" />}
              <div className={`grid h-11 w-11 place-items-center rounded-xl border transition ${
                isActive ? 'border-teal-200/30 bg-teal-200/12 text-teal-100' : 'border-white/10 bg-black/20 text-white/45 group-hover:text-teal-100'
              }`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold">{item.label}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/32">{item.hint}</div>
              </div>
            </motion.button>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.055] p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-100/80">当前境界</span>
          <span className="gold-chip rounded-full px-3 py-1 font-semibold">练气六层</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/35">
          <div className="h-full w-[56%] rounded-full bg-gradient-to-r from-teal-200 via-amber-200 to-rose-300" />
        </div>
      </div>
    </aside>
  );
}
