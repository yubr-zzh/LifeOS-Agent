import { useEffect, useState, type UIEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenCheck, ChevronLeft, ChevronRight, Palette, ScrollText } from 'lucide-react';
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
    detailTitle: '修为境界如何计算',
    detail:
      'LifeOS 参考《凡人修仙传》式修为结构，把个人成长分为练气、筑基、结丹、元婴、化神。练气期用层数表达细粒度进步，筑基以上用初期 / 中期 / 后期表达阶段推进。境界是长期成长状态，不是当天任务完成数。',
    formula: '境界进度 = 稳定执行 25% + 复盘质量 20% + 项目推进 20% + 心魔改善 15% + Skill 熟练度 10% + 长期目标一致性 10%',
    evidence: ['连续日志与复盘质量', '项目推进记录与突破节点', '心魔强度下降趋势', 'Skill 调用效果与反馈评分'],
    ui: ['洞府首页展示总境界', '成长轨迹展示子境界', '突破节点写入命运长河'],
    levels: [
      '练气期：一层 至 十三层',
      '筑基期：初期 / 初期巅峰 / 中期 / 中期巅峰 / 后期 / 后期巅峰',
      '结丹期：初期 / 初期巅峰 / 中期 / 中期巅峰 / 后期 / 后期巅峰',
      '元婴期：初期 / 初期巅峰 / 中期 / 中期巅峰 / 后期 / 后期巅峰',
      '化神期：初期 / 初期巅峰 / 中期 / 中期巅峰 / 后期 / 后期巅峰',
    ],
  },
  {
    title: '灵根组合',
    tag: 'Radar',
    body: '根雷达对应根目录，子雷达对应子目录。用户可以配置成长维度，但每周只允许调整一次组合。',
    points: ['默认维度来自当前成长主线', '点击维度进入子雷达', '历史组合可追踪回看'],
    detailTitle: '灵根雷达与文件系统目录',
    detail:
      '灵根不是五行标签，而是用户画像与成长维度的组合。根雷达表示一级成长目录，子雷达表示某个方向下的细分能力。用户可组建自己的灵根组合，但设置周锁，避免因为短期情绪频繁改盘。',
    formula: '根雷达 = 当前长期目标 + 子境界进度 + 近期日志主题 + Agent 识别到的能力倾向',
    evidence: ['AI Agent 技术栈、项目实战、算法能力等子境界', '每周一次组合调整记录', '子雷达维度与对应文件目录'],
    ui: ['成长轨迹页展示灵根阵盘', '点击维度进入子雷达', '历史灵根组合可回看'],
    levels: [],
  },
  {
    title: 'Agent 运行',
    tag: 'Harness',
    body: '每日输入会进入 Memory retrieval、Skill selection、Reflection generation、Harness evaluation、Memory update 链路。',
    points: ['每次 run 保留 trace', '反馈会影响 Skill 参数', '失败时保留可解释 fallback'],
    detailTitle: 'Harness 作为自进化训练场',
    detail:
      'Harness 不是普通日志，而是 Agent 自进化的证据链。每次用户提交修炼日志后，系统会记录输入解析、Memory 检索、Skill 选择、计划生成、评估、状态变化和持久化结果。',
    formula: 'Daily Input -> Memory Retrieval -> Skill Selection -> Reflection / Plan -> Evaluation -> Memory Update -> Skill Evolution',
    evidence: ['traceSteps 节点耗时与状态', 'retrievedMemory 与 selectedSkills', 'stateDiff 中的 Memory/Profile/Skill 变化'],
    ui: ['Harness 内核舱展示链路证据', 'Journal 提交后同步更新 trace', '反馈与 Dreaming 复用同一证据结构'],
    levels: [],
  },
  {
    title: 'Dreaming 与记忆',
    tag: 'Memory',
    body: 'Dreaming 在后台自主读取近期 logs、traces 与 feedbacks，决定哪些模式沉淀为长期文件式记忆。',
    points: ['短期记录进入 daily logs', '长期模式进入 memory vault', '沉淀内容由系统自主判断'],
    detailTitle: '离线凝练与文件式系统内存',
    detail:
      'Dreaming 让 Agent 不只在用户输入时响应，也能在后台压缩近期运行轨迹。它会从 logs、traces、feedbacks 中提炼长期模式，生成 memory proposals、skill proposals 和下一轮实验。',
    formula: 'Dreaming = 近期日志 + Harness traces + 用户反馈 -> 长期 Memory / Skill 参数 / 下一轮实验',
    evidence: ['memory-vault/profile.md', 'memories/*.md 与 skills/*.md', 'dreams/*.md 离线报告'],
    ui: ['Dreaming 页面展示后台凝练', 'Harness 页面可回放 Dreaming 证据', 'Memory 文件列表支持审查'],
    levels: [],
  },
];

const RuleDetailList = ({ title, items }: { title: string; items: string[] }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/38">{title}</div>
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="text-xs leading-relaxed text-white/52">
          {item}
        </div>
      ))}
    </div>
  </div>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [themeOpen, setThemeOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [activeRule, setActiveRule] = useState<number | null>(null);
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
                setActiveRule(null);
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
                  className={`absolute right-0 mt-3 overflow-hidden rounded-[1.45rem] border border-amber-200/14 bg-[#070b12]/92 shadow-[0_28px_90px_rgba(0,0,0,.46)] backdrop-blur-2xl ${activeRule === null ? 'w-[360px]' : 'w-[560px]'}`}
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
                  <div className="max-h-[620px] overflow-auto p-3 custom-scroll">
                    <AnimatePresence mode="wait">
                      {activeRule === null ? (
                        <motion.div
                          key="rule-list"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="space-y-2"
                        >
                          {ruleSections.map((section, index) => (
                            <button
                              key={section.title}
                              onClick={() => setActiveRule(index)}
                              className="w-full rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-left text-white/60 transition hover:border-amber-200/24 hover:bg-amber-200/[0.07] hover:text-white"
                            >
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="text-sm font-bold">{section.title}</span>
                                <ChevronRight size={15} className="text-amber-100/55" />
                              </div>
                              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">{section.tag}</div>
                            </button>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key={ruleSections[activeRule].title}
                          initial={{ opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.18 }}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <div className="text-lg font-black tracking-[-0.03em] text-white">{ruleSections[activeRule].detailTitle}</div>
                              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/48">{ruleSections[activeRule].tag} Setting</div>
                            </div>
                            <button
                              onClick={() => setActiveRule(null)}
                              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-white/45 transition hover:text-white"
                              title="返回"
                            >
                              <ChevronLeft size={15} />
                            </button>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-relaxed text-white/56">
                            {ruleSections[activeRule].detail}
                          </div>

                          <div className="mt-3 rounded-2xl border border-amber-200/14 bg-amber-200/[0.055] p-4">
                            <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-100/68">核心公式</div>
                            <div className="font-mono text-[11px] leading-relaxed text-white/68">{ruleSections[activeRule].formula}</div>
                          </div>

                          {ruleSections[activeRule].levels.length > 0 && (
                            <div className="mt-3 rounded-2xl border border-teal-200/14 bg-teal-200/[0.045] p-4">
                              <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-teal-100/70">完整境界划分</div>
                              <div className="space-y-2">
                                {ruleSections[activeRule].levels.map((level) => (
                                  <div key={level} className="rounded-xl border border-white/8 bg-black/18 px-3 py-2 text-xs leading-relaxed text-white/60">
                                    {level}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <RuleDetailList title="证据来源" items={ruleSections[activeRule].evidence} />
                            <RuleDetailList title="界面呈现" items={ruleSections[activeRule].ui} />
                          </div>

                          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/38">条目摘要</div>
                            <div className="space-y-2">
                              {ruleSections[activeRule].points.map((point) => (
                                <div key={point} className="flex items-center gap-2 text-xs text-white/48">
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200/80" />
                                  {point}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
              className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-black/42 px-4 text-xs font-semibold text-teal-100 shadow-[0_16px_44px_rgba(0,0,0,.28)] backdrop-blur-2xl transition hover:border-teal-200/30 hover:bg-teal-200/10"
            >
              <Palette size={17} />
              主题
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
