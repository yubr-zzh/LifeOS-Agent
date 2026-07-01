import { useEffect, useState, type UIEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenCheck, Palette, ScrollText } from 'lucide-react';
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

const ruleSections = [
  {
    title: '境界成长',
    tag: 'Realm',
    body: '境界不由任务数量单独决定，而由稳定执行、复盘质量、项目推进、心魔改善与 Skill 熟练度共同计算。',
    points: ['练气按层数推进', '筑基以上分初 / 中 / 后期', '关键突破需要连续证据支撑'],
  },
  {
    title: '灵根组合',
    tag: 'Radar',
    body: '根雷达对应根目录，子雷达对应子目录。用户可以配置成长维度，但每周只允许调整一次组合。',
    points: ['默认维度来自当前成长主线', '点击维度进入子雷达', '历史组合可追踪回看'],
  },
  {
    title: 'Agent 运行',
    tag: 'Harness',
    body: '每日输入会进入 Memory retrieval、Skill selection、Reflection generation、Harness evaluation、Memory update 链路。',
    points: ['每次 run 保留 trace', '反馈会影响 Skill 参数', '失败时保留可解释 fallback'],
  },
  {
    title: 'Dreaming 与记忆',
    tag: 'Memory',
    body: 'Dreaming 在后台自主读取近期 logs、traces 与 feedbacks，决定哪些模式沉淀为长期文件式记忆。',
    points: ['短期记录进入 daily logs', '长期模式进入 memory vault', '沉淀内容由系统自主判断'],
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [themeOpen, setThemeOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
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
    setRulesOpen(false);
    setChromeHidden(false);
  }, [currentPage]);

  useEffect(() => {
    const containers = Array.from(document.querySelectorAll<HTMLElement>('.custom-scroll'));
    const onScroll = (event: Event) => {
      const target = event.currentTarget;
      if (target instanceof HTMLElement) {
        const shouldHide = target.scrollTop > 32;
        setChromeHidden((current) => (current === shouldHide ? current : shouldHide));
        if (shouldHide) {
          setThemeOpen(false);
          setRulesOpen(false);
        }
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
      if (shouldHide) {
        setThemeOpen(false);
        setRulesOpen(false);
      }
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
              onClick={() => {
                setRulesOpen((value) => !value);
                setThemeOpen(false);
              }}
              title="规则设定"
              className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-black/42 px-4 text-xs font-semibold text-white/68 shadow-[0_16px_44px_rgba(0,0,0,.28)] backdrop-blur-2xl transition hover:border-amber-200/30 hover:bg-amber-200/10 hover:text-amber-50"
            >
              <ScrollText size={16} className="text-amber-100" />
              规则设定
            </button>
            <AnimatePresence>
              {rulesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-[430px] overflow-hidden rounded-[1.45rem] border border-amber-200/14 bg-[#070b12]/88 shadow-[0_28px_90px_rgba(0,0,0,.46)] backdrop-blur-2xl"
                >
                  <div className="border-b border-white/10 bg-amber-200/[0.045] px-5 py-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white/82">
                      <BookOpenCheck size={17} className="text-amber-100" />
                      LifeOS 规则设定
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-white/42">
                      这里说明系统如何把日常记录转化为境界、灵根、记忆与自进化反馈。
                    </div>
                  </div>
                  <div className="max-h-[560px] space-y-3 overflow-auto p-4 custom-scroll">
                    {ruleSections.map((section) => (
                      <div key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="text-sm font-bold text-white/82">{section.title}</div>
                          <span className="rounded-full border border-amber-200/16 bg-amber-200/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100/62">
                            {section.tag}
                          </span>
                        </div>
                        <div className="text-xs leading-relaxed text-white/50">{section.body}</div>
                        <div className="mt-3 grid gap-2">
                          {section.points.map((point) => (
                            <div key={point} className="flex items-center gap-2 text-xs text-white/46">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200/80" />
                              {point}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative">
            <button
              onClick={() => {
                setThemeOpen((value) => !value);
                setRulesOpen(false);
              }}
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
