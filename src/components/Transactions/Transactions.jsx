import { useContext, useState } from 'react';
import { FinanceContext } from '../../context/financeContext';
import { parseKey, fmt } from '../../utils/helpers';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Trash2, TrendingUp, TrendingDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Transactions() {
  const { data, viewMonth, setViewMonth, deleteTransaction } = useContext(FinanceContext);
  const [filter, setFilter] = useState('all');
  
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const changeMonth = (delta) => {
    setViewMonth(delta > 0 ? addMonths(viewMonth, 1) : subMonths(viewMonth, 1));
  };
  
  let allTx = [];
  
  Object.keys(data).forEach(k => {
    const { y, m } = parseKey(k);
    if (y !== year || m !== month) return;
    (data[k].transactions || []).forEach(tx => allTx.push({ ...tx, dateKey: k }));
  });
  
  allTx.sort((a, b) => {
    const cmp = b.dateKey.localeCompare(a.dateKey);
    if (cmp !== 0) return cmp;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });
  
  if (filter !== 'all') {
    allTx = allTx.filter(tx => tx.type === filter);
  }

  return (
    <section className="p-6 md:p-8 flex-1 w-full animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button 
            className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-semibold transition-all border ${filter === 'all' ? 'bg-accent/20 border-accent text-accent' : 'bg-bg-tertiary border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'}`} 
            onClick={() => setFilter('all')}
          >
            <Filter className="w-4 h-4" /> Todas
          </button>
          <button 
            className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-semibold transition-all border ${filter === 'income' ? 'bg-accent/20 border-accent text-accent' : 'bg-bg-tertiary border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'}`} 
            onClick={() => setFilter('income')}
          >
            <TrendingUp className="w-4 h-4" /> Ingresos
          </button>
          <button 
            className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-semibold transition-all border ${filter === 'expense' ? 'bg-accent/20 border-accent text-accent' : 'bg-bg-tertiary border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'}`} 
            onClick={() => setFilter('expense')}
          >
            <TrendingDown className="w-4 h-4" /> Gastos
          </button>
        </div>

        {/* Navegador del mes */}
        <div className="flex items-center gap-3 self-center sm:self-auto bg-bg-card border border-white/10 px-3 py-1.5 rounded-full">
          <button
            className="w-8 h-8 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-primary hover:bg-accent/20 hover:border-accent hover:text-accent transition-all"
            onClick={() => changeMonth(-1)}
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-text-primary min-w-[140px] text-center capitalize">
            {format(viewMonth, 'MMMM yyyy', { locale: es })}
          </span>
          <button
            className="w-8 h-8 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-primary hover:bg-accent/20 hover:border-accent hover:text-accent transition-all"
            onClick={() => changeMonth(1)}
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        {allTx.length === 0 ? (
          <div className="text-center p-8 bg-bg-card rounded-xl border border-white/10 text-text-muted text-sm">
            Sin transacciones para este mes
          </div>
        ) : (
          allTx.map(tx => {
            const { y, m, d } = parseKey(tx.dateKey);
            const dateStr = new Date(y, m, d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
            const isIncome = tx.type === 'income';
            
            return (
              <div key={tx.id} className="flex items-center gap-3.5 bg-bg-card border border-white/10 rounded-xl p-3.5 px-4.5 transition-all hover:border-white/20 hover:bg-white/5 group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-finance-income/10 text-finance-income' : 'bg-finance-expense/10 text-finance-expense'}`}>
                  {isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text-primary">{tx.description || 'Sin descripción'}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{tx.category || '—'} · {dateStr}</div>
                </div>
                <div className={`text-base font-bold ${isIncome ? 'text-finance-income' : 'text-finance-expense'}`}>
                  {isIncome ? '+' : '-'}{fmt(tx.amount)}
                </div>
                <button className="text-text-muted hover:text-finance-expense hover:bg-finance-expense/10 p-1.5 rounded-lg transition-colors" onClick={() => deleteTransaction(tx.dateKey, tx.id)} title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
