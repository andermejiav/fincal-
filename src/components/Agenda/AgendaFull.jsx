import { useContext, useEffect, useRef } from 'react';
import { FinanceContext } from '../../context/FinanceContext';
import { parseKey, dateKey, dayLabel, todayKey } from '../../utils/helpers';
import { ChevronLeft, ChevronRight, CheckCircle2, Trash2 } from 'lucide-react';

export default function AgendaFull() {
  const { agendaDay, setAgendaDay, getDayData, toggleTask, deleteTask } = useContext(FinanceContext);
  const nowRef = useRef(null);
  
  const today = new Date();
  const isToday = agendaDay === todayKey();
  const nowH = today.getHours();
  const dayData = getDayData(agendaDay);
  const tasks = dayData.tasks || [];

  const changeAgendaDay = (delta) => {
    const { y, m, d } = parseKey(agendaDay);
    const nd = new Date(y, m, d + delta);
    setAgendaDay(dateKey(nd.getFullYear(), nd.getMonth(), nd.getDate()));
  };

  useEffect(() => {
    if (nowRef.current) {
      setTimeout(() => {
        nowRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);
    }
  }, [agendaDay]);

  const colorMap = {
    blue: 'bg-accent/10 border-accent',
    green: 'bg-finance-income/10 border-finance-income',
    purple: 'bg-accent-2/10 border-accent-2',
    orange: 'bg-orange-500/10 border-orange-500',
    red: 'bg-finance-expense/10 border-finance-expense',
    yellow: 'bg-finance-important/10 border-finance-important'
  };

  const hours = Array.from({ length: 24 }).map((_, h) => {
    const isNow = isToday && h === nowH;
    const hourTasks = tasks.filter(t => parseInt(t.start) === h);

    return (
      <div key={h} className="flex items-start min-h-[56px] border-b border-white/10 hover:bg-white/[0.02] transition-colors p-0">
        <div className="w-[60px] shrink-0 text-[11px] font-semibold text-text-muted px-3 py-2 text-right select-none">
          {String(h).padStart(2, '0')}:00
        </div>
        <div className={`flex-1 border-l border-white/10 relative min-h-[56px] py-1.5 px-4 flex flex-col gap-1.5 ${isNow ? 'border-t-2 border-t-accent mt-0' : ''}`} ref={isNow ? nowRef : null}>
          {isNow && <div className="absolute -left-1.5 -top-1.5 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_6px_#58a6ff]"></div>}
          
          {hourTasks.map(task => (
            <div key={task.id} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border-l-[3px] transition-opacity animate-in fade-in duration-200 ${colorMap[task.color || 'blue']} ${task.done ? 'opacity-40 line-through' : 'hover:opacity-85'}`}>
              <span className="text-[10px] font-bold text-text-muted shrink-0 whitespace-nowrap">{task.start}–{task.end}</span>
              <span className="text-[13px] font-semibold text-text-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{task.title}</span>
              {task.note && <span className="text-[11px] text-text-secondary hidden sm:inline">{task.note}</span>}
              
              <button className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.done ? 'bg-finance-income/20 border-finance-income text-finance-income' : 'border-white/20 text-text-muted hover:border-finance-income hover:text-finance-income'}`} onClick={() => toggleTask(agendaDay, task.id)} title={task.done ? 'Marcar pendiente' : 'Completar'}>
                {task.done && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button className="shrink-0 p-1 rounded-md text-text-muted hover:bg-finance-expense/20 hover:text-finance-expense transition-colors" onClick={() => deleteTask(agendaDay, task.id)} title="Eliminar">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  });

  return (
    <section className="p-6 md:p-8 flex-1 w-full animate-in fade-in duration-300">
      <div className="flex items-center justify-center gap-5 mb-6">
        <button className="w-10 h-10 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-primary hover:bg-accent/20 hover:border-accent hover:text-accent hover:scale-105 transition-all" onClick={() => changeAgendaDay(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-xl font-extrabold min-w-[280px] text-center text-text-primary">
          {dayLabel(agendaDay)}
        </div>
        <button className="w-10 h-10 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-primary hover:bg-accent/20 hover:border-accent hover:text-accent hover:scale-105 transition-all" onClick={() => changeAgendaDay(1)}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden shadow-sm">
        {hours}
      </div>
    </section>
  );
}
