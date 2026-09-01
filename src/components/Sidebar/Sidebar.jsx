import { useContext } from 'react';
import { FinanceContext } from '../../context/financeContext';
import { totals, parseKey, fmt } from '../../utils/helpers';
import { Calendar as CalendarIcon, BarChart3, ListOrdered, CalendarDays, X, CircleDollarSign } from 'lucide-react';

export default function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, data, viewMonth } = useContext(FinanceContext);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  
  let totalIncome = 0;
  let totalExpense = 0;
  
  Object.keys(data).forEach(k => {
    const { y, m } = parseKey(k);
    if (y === year && m === month) {
      const t = totals(data[k]);
      totalIncome += t.income;
      totalExpense += t.expense;
    }
  });
  
  const balance = totalIncome - totalExpense;

  const handleNav = (view) => {
    setCurrentView(view);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const navItems = [
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
    { id: 'summary', label: 'Resumen', icon: BarChart3 },
    { id: 'transactions', label: 'Transacciones', icon: ListOrdered },
    { id: 'agenda', label: 'Agenda del día', icon: CalendarDays },
  ];

  return (
    <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-bg-secondary border-r border-white/10 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex items-center justify-between p-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <CircleDollarSign className="w-6 h-6 text-accent" />
          <span className="text-xl font-extrabold bg-gradient-to-br from-accent to-accent-2 bg-clip-text text-transparent">FinCal</span>
        </div>
        <button className="md:hidden text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-bg-tertiary transition-colors" onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-3 pt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[0.92rem] font-medium transition-all text-left w-full
                ${isActive ? 'bg-accent/20 text-accent border border-accent/30' : 'text-text-secondary hover:bg-bg-card hover:text-text-primary border border-transparent'}`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="m-3 p-4 bg-gradient-to-br from-accent/10 to-accent-2/5 border border-accent/20 rounded-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Balance del mes</p>
        <p className={`text-3xl font-extrabold mb-3 ${balance >= 0 ? 'text-finance-income' : 'text-finance-expense'}`}>
          {fmt(balance)}
        </p>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-finance-income shrink-0"></span>
          <span className="text-xs text-text-secondary">Ingresos: {fmt(totalIncome)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-finance-expense shrink-0"></span>
          <span className="text-xs text-text-secondary">Gastos: {fmt(totalExpense)}</span>
        </div>
      </div>

      <div className="px-3 mt-auto mb-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2.5">Leyenda</p>
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-finance-important shrink-0"></span> Día importante</div>
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-finance-income shrink-0"></span> Tiene ingreso</div>
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-finance-expense shrink-0"></span> Tiene gasto</div>
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent-2 shrink-0"></span> Tiene tareas</div>
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent shrink-0"></span> Hoy</div>
      </div>
    </aside>
  );
}
