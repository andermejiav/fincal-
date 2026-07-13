import { useContext } from 'react';
import { FinanceContext } from '../../context/FinanceContext';
import { Menu, Plus } from 'lucide-react';

export default function Topbar({ onAddClick }) {
  const { setSidebarOpen, currentView } = useContext(FinanceContext);

  const viewTitles = {
    calendar: 'Calendario Financiero',
    summary: 'Resumen Mensual',
    transactions: 'Transacciones',
    agenda: 'Agenda del Día'
  };

  return (
    <header className="h-16 bg-bg-secondary border-b border-white/10 flex items-center px-6 gap-4 sticky top-0 z-40">
      <button 
        className="md:hidden text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors" 
        onClick={() => setSidebarOpen(prev => !prev)}
      >
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="text-lg font-bold text-text-primary flex-1">{viewTitles[currentView]}</h1>
      <div className="flex items-center">
        <button 
          className="flex items-center gap-2 bg-gradient-to-br from-accent to-accent-2 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-[0_0_16px_rgba(88,166,255,0.25)] hover:shadow-[0_4px_24px_rgba(88,166,255,0.25)] hover:opacity-90 hover:-translate-y-px transition-all" 
          onClick={onAddClick}
        >
          <Plus className="w-4 h-4" />
          Añadir
        </button>
      </div>
    </header>
  );
}
