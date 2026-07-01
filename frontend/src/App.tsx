import { useEffect, useState, type UIEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/dashboard/DashboardPage';
import DreamingPage from './components/dreaming/DreamingPage';
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
  const [themeOpen, setThemeOpen] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [visualTheme, setVisualTheme] = useState<VisualTheme>(() => {
    const cached = localStorage.getItem('lifeos:theme') as VisualTheme | null;
    return cached ?? 'dark';
  });

  useEffect(() => {
    localStorage.setItem('lifeos:theme', visualTheme);
  }, [visualTheme]);

  useEffect(() => {
    setThemeOpen(false);
    setChromeHidden(false);
  }, [currentPage]);

  useEffect(() => {
    const containers = Array.from(document.querySelectorAll<HTMLElement>('.custom-scroll'));
    const onScroll = (event: Event) => {
      const target = event.currentTarget;
      if (target instanceof HTMLElement) {
        const shouldHide = target.scrollTop > 32;
        setChromeHidden((current) => (current === shouldHide ? current : shouldHide));
        if (shouldHide) setThemeOpen(false);
      }
    };
    containers.forEach((container) => container.addEventListener('scroll', onScroll, { passive: true }));
    return () => containers.forEach((container) => container.removeEventListener('scroll', onScroll));
  }, [currentPage]);

  const handlePageScroll = (event: UIEvent<HTMLElement>) => {
    const target = event.target;
    if (target instanceof HTMLElement) {
      const shouldHide = target.scrollTop > 32;
      setChromeHidden((current) => (current === shouldHide ? current : shouldHide));
      if (shouldHide) setThemeOpen(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'journal':
        return <JournalPage />;
      case 'timeline':
        return <TimelinePage />;
      case 'dreaming':
        return <DreamingPage />;
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
        <motion.div
          animate={{ opacity: chromeHidden ? 0 : 1, y: chromeHidden ? -16 : 0, pointerEvents: chromeHidden ? 'none' : 'auto' }}
          transition={{ duration: 0.22 }}
          className="absolute right-6 top-6 z-40 flex items-start gap-3"
        >
          <div className="relative">
            <button
              onClick={() => setThemeOpen((value) => !value)}
              title="主题"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/42 text-teal-100 shadow-[0_16px_44px_rgba(0,0,0,.28)] backdrop-blur-2xl transition hover:border-teal-200/30 hover:bg-teal-200/10"
            >
              <Palette size={17} />
            </button>
            <AnimatePresence>
              {themeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-[250px] rounded-[1.35rem] border border-white/10 bg-black/58 p-3 shadow-[0_24px_70px_rgba(0,0,0,.38)] backdrop-blur-2xl"
                >
                  <div className="mb-2 px-2 text-xs font-semibold text-white/55">主题</div>
                  <div className="space-y-2">
                    {visualThemes.map((theme) => {
                      const active = visualTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => {
                            setVisualTheme(theme.id);
                            setThemeOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                            active
                              ? 'border-teal-200/35 bg-teal-200/12 text-white'
                              : 'border-white/8 bg-white/[0.035] text-white/52 hover:border-white/14 hover:text-white'
                          }`}
                        >
                          <span className={`h-3 w-12 rounded-full bg-gradient-to-r ${theme.swatch}`} />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">{theme.label}</span>
                            <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-white/32">{theme.hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="pointer-events-none flex h-11 items-center gap-3 rounded-full border border-white/10 bg-black/35 px-4 text-xs text-white/55 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.9)]" />
            LifeOS Agent Runtime
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 min-h-screen"
            onScrollCapture={handlePageScroll}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
