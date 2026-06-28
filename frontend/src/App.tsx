import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/dashboard/DashboardPage';
import JournalPage from './components/journal/JournalPage';
import TimelinePage from './components/timeline/TimelinePage';
import HarnessPage from './components/harness/HarnessPage';

export type VisualTheme = 'cyber-ink' | 'aurora' | 'dark' | 'light';

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
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        visualTheme={visualTheme}
        onThemeChange={setVisualTheme}
      />

      <main className="relative ml-[280px] flex-1">
        <div className="pointer-events-none fixed right-10 top-8 z-20 flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs text-white/55 backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.9)]" />
          LifeOS Agent Runtime
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
