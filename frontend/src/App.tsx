import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/dashboard/DashboardPage';
import JournalPage from './components/journal/JournalPage';
import TimelinePage from './components/timeline/TimelinePage';
import HarnessPage from './components/harness/HarnessPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
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
    <div className="flex min-h-screen bg-[#05060f] text-white overflow-hidden">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="flex-1 ml-72 relative">
        {/* Background decorative layer */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_0.8px,transparent_1px)] [background-size:40px_40px] opacity-30 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen relative z-10"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global floating orb indicator */}
      <div className="fixed bottom-8 right-8 w-6 h-6 bg-gradient-to-br from-violet-400 to-cyan-400 rounded-full shadow-[0_0_40px_#67e8f9] z-50 flex items-center justify-center">
        <div className="w-2 h-2 bg-black rounded-full animate-ping absolute" />
      </div>
    </div>
  );
}
