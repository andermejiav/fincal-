import { useContext, useState } from 'react';
import { FinanceContext } from './context/FinanceContext';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import Calendar from './components/Calendar/Calendar';
import Summary from './components/Summary/Summary';
import Transactions from './components/Transactions/Transactions';
import AgendaFull from './components/Agenda/AgendaFull';
import DayModal from './components/Modals/DayModal';
import AddModal from './components/Modals/AddModal';
import './styles/main.css';

function AppContent() {
  const { currentView, toastMsg, sidebarOpen } = useContext(FinanceContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="flex w-full min-h-screen bg-bg-primary overflow-hidden">
      <Sidebar />
      <main className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all ${!sidebarOpen && window.innerWidth > 768 ? 'ml-0' : ''}`} id="mainContent">
        <Topbar onAddClick={() => setIsAddModalOpen(true)} />
        
        {currentView === 'calendar' && <Calendar />}
        {currentView === 'summary' && <Summary />}
        {currentView === 'transactions' && <Transactions />}
        {currentView === 'agenda' && <AgendaFull />}
      </main>

      <DayModal />
      <AddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-bg-tertiary border border-white/10 text-text-primary px-6 py-3 rounded-full text-sm font-semibold z-[9999] shadow-lg transition-all duration-300 ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} id="toast">
        {toastMsg}
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
