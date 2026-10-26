import { useContext } from 'react';
import { FinanceContext } from '../../context/financeContext';
import { totals, fmt, fmtShort } from '../../utils/helpers';
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar() {
  const { viewMonth, setViewMonth, data, setActiveDay } = useContext(FinanceContext);
  
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  
  const firstDay = startOfMonth(viewMonth).getDay();
  const daysInMonthCount = getDaysInMonth(viewMonth);
  const todayDate = new Date();

  const changeMonth = (delta) => {
    setViewMonth(delta > 0 ? addMonths(viewMonth, 1) : subMonths(viewMonth, 1));
  };

  const blanks = Array.from({ length: firstDay }).map((_, i) => (
    <div key={`blank-${i}`} className="bg-transparent rounded-xl"></div>
  ));

  const days = Array.from({ length: daysInMonthCount }).map((_, i) => {
    const d = i + 1;
    const currentDay = new Date(year, month, d);
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayData = data[key] || { important: false, transactions: [], tasks: [] };
    const { income, expense } = totals(dayData);
    const taskCount = (dayData.tasks || []).length;
    
    const isTodayFlag = isSameDay(currentDay, todayDate);
    
    return (
      <div 
        key={key} 
        className={`bg-bg-card border border-white/10 rounded-xl p-2 cursor-pointer flex flex-col gap-1 transition-all hover:border-white/20 hover:bg-white/5 hover:scale-[1.01] hover:shadow-lg relative overflow-hidden h-full min-h-[60px]
          ${isTodayFlag ? 'border-accent bg-accent/10 shadow-[inset_0_0_0_1px_#58a6ff,0_0_16px_rgba(88,166,255,0.1)]' : ''}
          ${dayData.important ? 'border-finance-important bg-finance-important/15' : ''}
        `}
        onClick={() => setActiveDay(key)}
      >
        {dayData.important && <span className="absolute top-1 right-1 text-[10px]">⭐</span>}
        <div className={`text-sm font-bold leading-none shrink-0 ${isTodayFlag ? 'bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : 'text-text-primary'}`}>
          {d}
        </div>
        <div className="flex flex-col xl:flex-row gap-1 mt-auto flex-wrap">
          {income > 0 && <span title={`Ingresos: ${fmt(income)}`} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-finance-income/10 text-finance-income whitespace-nowrap overflow-hidden text-ellipsis">+{fmtShort(income)}</span>}
          {expense > 0 && <span title={`Gastos: ${fmt(expense)}`} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-finance-expense/10 text-finance-expense whitespace-nowrap overflow-hidden text-ellipsis">-{fmtShort(expense)}</span>}
          {taskCount > 0 && <span title={`${taskCount} tarea(s)`} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-2/15 text-accent-2 whitespace-nowrap overflow-hidden text-ellipsis">{taskCount}</span>}
        </div>
      </div>
    );
  });

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Calculate rows needed (first day offset + total days, divided by 7 columns)
  const totalCells = firstDay + daysInMonthCount;
  const rows = Math.ceil(totalCells / 7);

  return (
    <section className="p-4 md:p-6 flex-1 flex flex-col h-full w-full animate-in fade-in duration-300">
      <div className="flex items-center justify-center gap-6 mb-4 shrink-0">
        <button className="w-10 h-10 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-primary hover:bg-accent/20 hover:border-accent hover:text-accent hover:scale-105 transition-all" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-2xl font-extrabold min-w-[220px] text-center capitalize">
          {format(viewMonth, 'MMMM yyyy', { locale: es })}
        </div>
        <button className="w-10 h-10 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-primary hover:bg-accent/20 hover:border-accent hover:text-accent hover:scale-105 transition-all" onClick={() => changeMonth(1)}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1 shrink-0">
        {weekDays.map(wd => (
          <span key={wd} className="text-center text-xs font-bold uppercase tracking-wider text-text-muted py-1">
            {wd}
          </span>
        ))}
      </div>

      {/* Grid flex-1 makes it fill the rest of the height, and grid-rows stretches its children */}
      <div 
        className="grid grid-cols-7 gap-1.5 flex-1 w-full" 
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {blanks}
        {days}
      </div>
    </section>
  );
}
