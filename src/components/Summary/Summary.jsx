import { useContext, useMemo, useState } from 'react';
import { FinanceContext } from '../../context/financeContext';
import { parseKey, totals, fmt, dateKey } from '../../utils/helpers';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar as CalendarIcon, Star, 
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Minus, 
  Percent, ArrowRight, CalendarRange, Filter
} from 'lucide-react';

export default function Summary() {
  const { data, viewMonth, setViewMonth } = useContext(FinanceContext);
  const [tableRange, setTableRange] = useState('year'); // 'year' | '6months'
  const [hideEmptyMonths, setHideEmptyMonths] = useState(false);
  
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (delta) => {
    setViewMonth(delta > 0 ? addMonths(viewMonth, 1) : subMonths(viewMonth, 1));
  };
  
  // Totales y flujo diario para el mes actual seleccionado
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

  // Función auxiliar para obtener totales de cualquier mes
  const getMonthTotals = useMemo(() => {
    return (targetYear, targetMonth) => {
      let inc = 0;
      let exp = 0;
      let txs = 0;

      Object.keys(data).forEach(k => {
        const { y, m } = parseKey(k);
        if (y === targetYear && m === targetMonth) {
          const t = totals(data[k]);
          inc += t.income;
          exp += t.expense;
          txs += (data[k].transactions || []).length;
        }
      });

      const bal = inc - exp;
      return { income: inc, expense: exp, balance: bal, txCount: txs };
    };
  }, [data]);

  // Cálculo de tabla comparativa mes a mes
  const monthlyComparisonData = useMemo(() => {
    let monthsToCompare = [];

    if (tableRange === 'year') {
      // 12 meses del año del viewMonth
      for (let m = 0; m < 12; m++) {
        monthsToCompare.push(new Date(year, m, 1));
      }
    } else {
      // Últimos 6 meses terminando en viewMonth
      for (let i = 5; i >= 0; i--) {
        monthsToCompare.push(subMonths(viewMonth, i));
      }
    }

    return monthsToCompare.map(mDate => {
      const y = mDate.getFullYear();
      const m = mDate.getMonth();
      const curr = getMonthTotals(y, m);
      
      // Mes anterior para comparar
      const prevDate = subMonths(mDate, 1);
      const prev = getMonthTotals(prevDate.getFullYear(), prevDate.getMonth());

      // 1. Variación porcentual de Ingresos
      const incomeDiff = curr.income - prev.income;
      let incomePct = 0;
      let incomePctLabel = '0%';
      let incomeTrend = 'neutral';

      if (prev.income > 0) {
        incomePct = (incomeDiff / prev.income) * 100;
        incomePctLabel = `${incomePct >= 0 ? '+' : ''}${incomePct.toFixed(1)}%`;
        incomeTrend = incomePct > 0 ? 'up' : incomePct < 0 ? 'down' : 'neutral';
      } else if (curr.income > 0) {
        incomePct = 100;
        incomePctLabel = '+100%';
        incomeTrend = 'up';
      }

      // 2. Variación porcentual de Ganancias / Pérdidas (Balance Neto)
      const balanceDiff = curr.balance - prev.balance;
      let balancePct = 0;
      let balancePctLabel = '0%';
      let balanceStatus = 'neutral';

      if (Math.abs(prev.balance) > 0) {
        balancePct = (balanceDiff / Math.abs(prev.balance)) * 100;
        balancePctLabel = `${balancePct >= 0 ? '+' : ''}${balancePct.toFixed(1)}%`;
        
        if (curr.balance >= 0) {
          balanceStatus = balanceDiff >= 0 ? 'gain_up' : 'gain_down';
        } else {
          balanceStatus = balanceDiff >= 0 ? 'loss_reduced' : 'loss_increased';
        }
      } else if (curr.balance !== 0) {
        if (curr.balance > 0) {
          balancePct = 100;
          balancePctLabel = '+100%';
          balanceStatus = 'gain_up';
        } else {
          balancePct = -100;
          balancePctLabel = '-100%';
          balanceStatus = 'loss_increased';
        }
      }

      // 3. Margen de Ganancia sobre ingresos (%)
      const marginPct = curr.income > 0 ? ((curr.balance / curr.income) * 100).toFixed(1) : null;

      const isCurrentViewMonth = y === year && m === month;
      const hasMovement = curr.income > 0 || curr.expense > 0;

      return {
        date: mDate,
        monthName: format(mDate, 'MMMM yyyy', { locale: es }),
        income: curr.income,
        expense: curr.expense,
        balance: curr.balance,
        txCount: curr.txCount,
        hasMovement,
        isCurrentViewMonth,
        prevMonthName: format(prevDate, 'MMM yyyy', { locale: es }),
        incomeDiff,
        incomePct,
        incomePctLabel,
        incomeTrend,
        balanceDiff,
        balancePct,
        balancePctLabel,
        balanceStatus,
        marginPct
      };
    }).filter(row => !hideEmptyMonths || row.hasMovement);
  }, [tableRange, hideEmptyMonths, year, month, viewMonth, getMonthTotals]);

  // Métricas del mes actual respecto al mes anterior para la tarjeta destacada
  const currentMonthComparison = useMemo(() => {
    const prevDate = subMonths(viewMonth, 1);
    const prevTotals = getMonthTotals(prevDate.getFullYear(), prevDate.getMonth());

    const incDiff = totalIncome - prevTotals.income;
    let incPct = 0;
    if (prevTotals.income > 0) {
      incPct = (incDiff / prevTotals.income) * 100;
    } else if (totalIncome > 0) {
      incPct = 100;
    }

    const balDiff = balance - prevTotals.balance;
    let balPct = 0;
    if (Math.abs(prevTotals.balance) > 0) {
      balPct = (balDiff / Math.abs(prevTotals.balance)) * 100;
    } else if (balance !== 0) {
      balPct = balance > 0 ? 100 : -100;
    }

    const margin = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

    return {
      prevMonthName: format(prevDate, 'MMMM yyyy', { locale: es }),
      incDiff,
      incPct,
      balDiff,
      balPct,
      margin
    };
  }, [viewMonth, totalIncome, balance, getMonthTotals]);

  return (
    <section className="p-6 md:p-8 flex-1 w-full animate-in fade-in duration-300 flex flex-col gap-8">
      {/* Encabezado con navegación de mes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Resumen Mensual</h2>
          <p className="text-xs text-text-secondary mt-1">
            Analiza el rendimiento, flujo de caja y la evolución financiera mes a mes.
          </p>
        </div>
        
        {/* Navegador del mes */}
        <div className="flex items-center gap-3 self-center sm:self-auto bg-bg-card border border-white/10 px-3 py-1.5 rounded-full shadow-sm">
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
      
      {/* 5 Tarjetas KPI principales del mes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-bg-card border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/20 transition-colors shadow-sm">
          <DollarSign className="w-8 h-8 text-finance-income" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total ingresos</span>
          <span className="text-2xl font-bold text-finance-income">{fmt(totalIncome)}</span>
        </div>
        
        <div className="bg-bg-card border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/20 transition-colors shadow-sm">
          <DollarSign className="w-8 h-8 text-finance-expense" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total gastos</span>
          <span className="text-2xl font-bold text-finance-expense">{fmt(totalExpense)}</span>
        </div>
        
        <div className="bg-bg-card border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/20 transition-colors shadow-sm">
          {balance >= 0 ? <TrendingUp className="w-8 h-8 text-finance-income" /> : <TrendingDown className="w-8 h-8 text-finance-expense" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Balance neto</span>
          <span className={`text-2xl font-bold ${balance >= 0 ? 'text-finance-income' : 'text-finance-expense'}`}>{fmt(balance)}</span>
        </div>
        
        <div className="bg-bg-card border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/20 transition-colors shadow-sm">
          <Star className="w-8 h-8 text-finance-important" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Días importantes</span>
          <span className="text-2xl font-bold text-text-primary">{importantDays}</span>
        </div>
        
        <div className="bg-bg-card border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/20 transition-colors shadow-sm">
          <CalendarIcon className="w-8 h-8 text-accent-2" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Tareas del mes</span>
          <span className="text-2xl font-bold text-text-primary">{totalTasks}</span>
        </div>
      </div>

      {/* Tarjeta de Comparativa vs Mes Anterior */}
      <div className="bg-gradient-to-r from-bg-card to-bg-secondary border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Comparativa con el mes anterior ({currentMonthComparison.prevMonthName})
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Crecimiento de ingresos y variación de ganancias en el mes actual.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start md:justify-end">
          {/* Variación de Ingresos */}
          <div className="bg-bg-tertiary/70 border border-white/5 rounded-xl px-4 py-2 flex flex-col">
            <span className="text-[11px] text-text-secondary font-medium">Ingresos</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {currentMonthComparison.incDiff >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-finance-income" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-finance-expense" />
              )}
              <span className={`text-sm font-bold ${currentMonthComparison.incDiff >= 0 ? 'text-finance-income' : 'text-finance-expense'}`}>
                {currentMonthComparison.incPct >= 0 ? '+' : ''}{currentMonthComparison.incPct.toFixed(1)}%
              </span>
              <span className="text-[11px] text-text-muted ml-1">
                ({currentMonthComparison.incDiff >= 0 ? '+' : ''}{fmt(currentMonthComparison.incDiff)})
              </span>
            </div>
          </div>

          {/* Variación de Ganancias / Pérdidas */}
          <div className="bg-bg-tertiary/70 border border-white/5 rounded-xl px-4 py-2 flex flex-col">
            <span className="text-[11px] text-text-secondary font-medium">Ganancia / Balance</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {currentMonthComparison.balDiff >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-finance-income" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-finance-expense" />
              )}
              <span className={`text-sm font-bold ${currentMonthComparison.balDiff >= 0 ? 'text-finance-income' : 'text-finance-expense'}`}>
                {currentMonthComparison.balPct >= 0 ? '+' : ''}{currentMonthComparison.balPct.toFixed(1)}%
              </span>
              <span className="text-[11px] text-text-muted ml-1">
                ({currentMonthComparison.balDiff >= 0 ? '+' : ''}{fmt(currentMonthComparison.balDiff)})
              </span>
            </div>
          </div>

          {/* Margen de ganancia */}
          <div className="bg-bg-tertiary/70 border border-white/5 rounded-xl px-4 py-2 flex flex-col">
            <span className="text-[11px] text-text-secondary font-medium">Margen del mes</span>
            <span className={`text-sm font-bold mt-0.5 ${parseFloat(currentMonthComparison.margin) >= 0 ? 'text-accent' : 'text-finance-expense'}`}>
              {currentMonthComparison.margin}%
            </span>
          </div>
        </div>
      </div>

      {/* ── TABLA DE EVOLUCIÓN Y COMPARATIVA MES A MES ── */}
      <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-text-primary">Evolución y Ganancias Mes a Mes</h3>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Visualiza en porcentaje cómo aumentaron las ganancias o pérdidas de un mes a otro.
            </p>
          </div>

          {/* Controles de la tabla */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="flex bg-bg-tertiary border border-white/10 rounded-xl p-0.5 text-xs">
              <button
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  tableRange === 'year'
                    ? 'bg-accent/20 text-accent border border-accent/30 shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => setTableRange('year')}
              >
                Año {year}
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  tableRange === '6months'
                    ? 'bg-accent/20 text-accent border border-accent/30 shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => setTableRange('6months')}
              >
                Últimos 6 meses
              </button>
            </div>

            <button
              onClick={() => setHideEmptyMonths(prev => !prev)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                hideEmptyMonths
                  ? 'bg-accent/15 border-accent/40 text-accent font-semibold'
                  : 'bg-bg-tertiary border-white/10 text-text-secondary hover:text-text-primary'
              }`}
              title="Ocultar meses sin movimientos registrados"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Solo con datos</span>
            </button>
          </div>
        </div>

        {/* Tabla responsive */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-bg-tertiary/70 text-text-secondary border-b border-white/10 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Mes</th>
                <th className="py-3 px-4 text-right">Ingresos</th>
                <th className="py-3 px-4 text-right">Gastos</th>
                <th className="py-3 px-4 text-right">Ganancia Neta</th>
                <th className="py-3 px-4 text-center">Var. Ingresos %</th>
                <th className="py-3 px-4 text-center">Var. Ganancia / Pérdida %</th>
                <th className="py-3 px-4 text-center">Margen</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {monthlyComparisonData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-muted text-sm">
                    No hay registros disponibles para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                monthlyComparisonData.map((row) => {
                  return (
                    <tr
                      key={row.monthName}
                      onClick={() => setViewMonth(row.date)}
                      className={`group transition-colors cursor-pointer hover:bg-white/[0.03] ${
                        row.isCurrentViewMonth
                          ? 'bg-accent/10 border-l-4 border-l-accent font-medium'
                          : ''
                      }`}
                      title="Haz clic para seleccionar este mes en el calendario y resumen"
                    >
                      {/* Mes */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="capitalize font-semibold text-text-primary">
                            {row.monthName}
                          </span>
                          {row.isCurrentViewMonth && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                              Actual
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ingresos */}
                      <td className="py-3 px-4 text-right font-medium text-finance-income">
                        {fmt(row.income)}
                      </td>

                      {/* Gastos */}
                      <td className="py-3 px-4 text-right font-medium text-finance-expense">
                        {fmt(row.expense)}
                      </td>

                      {/* Ganancia Neta */}
                      <td className="py-3 px-4 text-right font-bold">
                        <span className={row.balance >= 0 ? 'text-finance-income' : 'text-finance-expense'}>
                          {row.balance > 0 ? '+' : ''}{fmt(row.balance)}
                        </span>
                      </td>

                      {/* Variación de Ingresos % */}
                      <td className="py-3 px-4 text-center">
                        {row.incomeTrend === 'up' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-finance-income/15 text-finance-income">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            {row.incomePctLabel}
                          </span>
                        )}
                        {row.incomeTrend === 'down' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-finance-expense/15 text-finance-expense">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            {row.incomePctLabel}
                          </span>
                        )}
                        {row.incomeTrend === 'neutral' && (
                          <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                            <Minus className="w-3 h-3" />
                            0%
                          </span>
                        )}
                      </td>

                      {/* Variación de Ganancia / Pérdida % */}
                      <td className="py-3 px-4 text-center">
                        {row.balanceStatus === 'gain_up' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-finance-income/20 text-finance-income border border-finance-income/30">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            {row.balancePctLabel}
                          </span>
                        )}
                        {row.balanceStatus === 'gain_down' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            {row.balancePctLabel}
                          </span>
                        )}
                        {row.balanceStatus === 'loss_reduced' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            {row.balancePctLabel} (Menor pérdida)
                          </span>
                        )}
                        {row.balanceStatus === 'loss_increased' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-finance-expense/20 text-finance-expense border border-finance-expense/30">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            {row.balancePctLabel}
                          </span>
                        )}
                        {row.balanceStatus === 'neutral' && (
                          <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                            <Minus className="w-3 h-3" />
                            0%
                          </span>
                        )}
                      </td>

                      {/* Margen */}
                      <td className="py-3 px-4 text-center font-medium">
                        {row.marginPct !== null ? (
                          <span className={`text-xs font-semibold ${parseFloat(row.marginPct) >= 0 ? 'text-accent' : 'text-finance-expense'}`}>
                            {row.marginPct}%
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4 text-center">
                        {row.balance > 0 ? (
                          <span className="inline-block text-[11px] font-semibold text-finance-income bg-finance-income/10 px-2 py-0.5 rounded">
                            Superávit
                          </span>
                        ) : row.balance < 0 ? (
                          <span className="inline-block text-[11px] font-semibold text-finance-expense bg-finance-expense/10 px-2 py-0.5 rounded">
                            Déficit / Pérdida
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] text-text-muted">
                            Equilibrado
                          </span>
                        )}
                      </td>

                      {/* Acción */}
                      <td className="py-3 px-4 text-center">
                        <button
                          className="text-xs text-accent hover:text-accent-2 transition-colors flex items-center justify-center gap-1 mx-auto font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewMonth(row.date);
                          }}
                        >
                          <span>Ver</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Gráfico de flujo diario */}
      <div className="bg-bg-card border border-white/10 rounded-2xl p-6 min-w-0 shadow-sm">
        <h3 className="text-base font-bold mb-5 text-text-primary">Flujo de caja diario ({format(viewMonth, 'MMMM yyyy', { locale: es })})</h3>
        <div className="h-[280px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8b949e', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b949e', fontSize: 12 }} tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#161b22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e6edf3' }} itemStyle={{ fontWeight: 'bold' }} formatter={(value) => fmt(value)} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="ingresos" name="Ingresos" fill="var(--color-finance-income, #3fb950)" radius={[4, 4, 0, 0]} maxBarSize={12} />
              <Bar dataKey="gastos" name="Gastos" fill="var(--color-finance-expense, #f85149)" radius={[4, 4, 0, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
