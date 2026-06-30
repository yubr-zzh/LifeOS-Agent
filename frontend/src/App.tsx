import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/dashboard/DashboardPage';
import JournalPage from './components/journal/JournalPage';
import TimelinePage from './components/timeline/TimelinePage';
import HarnessPage from './components/harness/HarnessPage';

export type VisualTheme = 'cyber-ink' | 'aurora' | 'dark' | 'light';

const visualThemes: Array<{ id: VisualTheme; label: string; hint: string; swatch: string }> = [
  { id: 'cyber-ink', label: '赛博水墨', hint: 'Cyber Ink', swatch: 'from-fuchsia-400 via-teal-200 to-emerald-300' },
  { id: 'aurora', label: '蓝紫高级', hint: 'Aurora', swatch: 'from-blue-400 via-violet-400 to-fuchsia-300' },
  { id: 'dark', label: '玄夜 Dark', hint: 'Current', swatch: 'from-teal-200 via-amber-200 to-rose-300' },
  { id: 'light', label: '清昼 Light', hint: 'Light', swatch: 'from-sky-200 via-white to-amber-200' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [visualTheme, setVisualTheme] = useState<VisualTheme>(() => {
    const cached = localStorage.getItem('lifeos:theme') as VisualTheme | null;
    return cached ?? 'dark';
  });

  useEffect(() => {
    localStorage.setItem('lifeos:theme', visualTheme);
  }, [visualTheme]);

  const renderPage = () => {
    switch (currentPage) {
      case 'journal':
        return <JournalPage />;
      case 'timeline':
        return <TimelinePage />;
      case 'harness':
        return <HarnessPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div data-theme={visualTheme} className="lifeos-shell flex min-h-screen overflow-hidden text-[#f7f3e8]">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="relative ml-[280px] flex-1">
        <div className="absolute right-6 top-6 z-40 flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/38 px-3 py-2 text-xs text-white/60 shadow-[0_16px_44px_rgba(0,0,0,.28)] backdrop-blur-2xl">
            <Palette size={14} className="text-teal-100/80" />
            <span className="hidden xl:inline">主题</span>
            <div className="ml-1 flex items-center gap-1">
              {visualThemes.map((theme) => {
                const active = visualTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setVisualTheme(theme.id)}
                    title={`${theme.label} / ${theme.hint}`}
                    className={`group flex h-8 items-center gap-2 rounded-full border px-2.5 transition ${
                      active
                        ? 'border-teal-200/35 bg-teal-200/12 text-white'
                        : 'border-transparent bg-white/[0.035] text-white/45 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <span className={`h-2.5 w-8 rounded-full bg-gradient-to-r ${theme.swatch}`} />
                    <span className={`${active ? 'inline' : 'hidden 2xl:inline'} text-[11px] font-semibold`}>{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pointer-events-none flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs text-white/55 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.9)]" />
            LifeOS Agent Runtime
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 min-h-screen"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
