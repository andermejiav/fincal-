import { useContext, useMemo } from 'react';
import { FinanceContext } from '../../context/FinanceContext';
import { parseKey, totals, fmt, dateKey } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar as CalendarIcon, Star } from 'lucide-react';

export default function Summary() {
  const { data, viewMonth } = useContext(FinanceContext);
  
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const { chartData, totalIncome, totalExpense, balance, importantDays, totalTasks } = useMemo(() => {
    let tIncome = 0;
    let tExpense = 0;
    let iDays = 0;
    let tTasks = 0;
    const flow = [];

    const dailyFlow = {};
    Object.keys(data).forEach(k => {
      const { y, m } = parseKey(k);
      if (y !== year || m !== month) return;
      
      const t = totals(data[k]);
      tIncome += t.income;
      tExpense += t.expense;
      if (data[k].important) iDays++;
      tTasks += (data[k].tasks || []).length;
      dailyFlow[k] = t;
    });

    for (let d = 1; d <= daysInMonth; d++) {
      const k = dateKey(year, month, d);
      const f = dailyFlow[k] || { income: 0, expense: 0 };
      flow.push({
        day: String(d),
        ingresos: f.income,
        gastos: f.expense
      });
    }

    return {
      chartData: flow,
      totalIncome: tIncome,
      totalExpense: tExpense,
      balance: tIncome - tExpense,
      importantDays: iDays,
      totalTasks: tTasks
    };
  }, [data, year, month, daysInMonth]);

  return (
    <section className="p-6 md:p-8 flex-1 w-full animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold mb-6 text-text-primary">Resumen Mensual</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-bg-card border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/20 transition-colors">
          <DollarSign className="w-8 h-8 text-finance-income" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total ingresos</span>
          <span className="text-2xl font-bold text-finance-income">{fmt(totalIncome)}</span>
        </div>
        
        <div className="bg-bg-card border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/20 transition-colors">
          <DollarSign className="w-8 h-8 text-finance-expense" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total gastos</span>
          <span className="text-2xl font-bold text-finance-expense">{fmt(totalExpense)}</span>
        </div>
        
        <div className="bg-bg-card border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/20 transition-colors">
          {balance >= 0 ? <TrendingUp className="w-8 h-8 text-finance-income" /> : <TrendingDown className="w-8 h-8 text-finance-expense" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Balance</span>
          <span className={`text-2xl font-bold ${balance >= 0 ? 'text-finance-income' : 'text-finance-expense'}`}>{fmt(balance)}</span>
        </div>
        
        <div className="bg-bg-card border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/20 transition-colors">
          <Star className="w-8 h-8 text-finance-important" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Días importantes</span>
          <span className="text-2xl font-bold text-text-primary">{importantDays}</span>
        </div>
        
        <div className="bg-bg-card border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/20 transition-colors">
          <CalendarIcon className="w-8 h-8 text-accent-2" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Tareas del mes</span>
          <span className="text-2xl font-bold text-text-primary">{totalTasks}</span>
        </div>
      </div>
      
      <div className="bg-bg-card border border-white/10 rounded-2xl p-6">
        <h3 className="text-base font-bold mb-5 text-text-primary">Flujo de caja diario</h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8b949e', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b949e', fontSize: 12 }} tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#161b22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e6edf3' }} itemStyle={{ fontWeight: 'bold' }} formatter={(value) => fmt(value)} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="ingresos" name="Ingresos" fill="#3fb950" radius={[4, 4, 0, 0]} maxBarSize={12} />
              <Bar dataKey="gastos" name="Gastos" fill="#f85149" radius={[4, 4, 0, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
