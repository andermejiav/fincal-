import { useContext, useState, useEffect, useRef } from 'react';
import { FinanceContext } from '../../context/FinanceContext';
import { dayLabel, todayKey, uid, fmt, totals } from '../../utils/helpers';
import { X, Star, CalendarDays, DollarSign, TrendingUp, TrendingDown, CheckCircle2, Trash2, Plus } from 'lucide-react';

export default function DayModal() {
  const { 
    activeDay, setActiveDay, getDayData, 
    toggleHighlight, addTask, toggleTask, deleteTask, 
    addTransaction, deleteTransaction 
  } = useContext(FinanceContext);
  
  const [activeTab, setActiveTab] = useState('agenda');
  
  const [taskTime, setTaskTime] = useState('08:00');
  const [taskEndTime, setTaskEndTime] = useState('09:00');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskColor, setTaskColor] = useState('blue');
  const [taskNote, setTaskNote] = useState('');
  
  const [txType, setTxType] = useState('income');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState('');

  const nowRef = useRef(null);

  useEffect(() => {
    if (activeDay && activeTab === 'agenda') {
      setTimeout(() => {
        if (nowRef.current) nowRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);
    }
  }, [activeDay, activeTab]);

  if (!activeDay) return null;

  const dayData = getDayData(activeDay);
  const isToday = activeDay === todayKey();
  const today = new Date();
  const nowH = today.getHours();
  
  const handleSaveTask = () => {
    if (!taskTitle.trim()) return alert('Escribe una tarea');
    if (!taskTime || !taskEndTime) return alert('Indica la hora');
    
    addTask(activeDay, {
      id: uid(),
      start: taskTime,
      end: taskEndTime,
      title: taskTitle.trim(),
      color: taskColor,
      note: taskNote.trim(),
      done: false
    });
    
    setTaskTitle('');
    setTaskNote('');
  };

  const handleSaveTx = () => {
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) return alert('Ingresa un monto válido');
    
    addTransaction(activeDay, {
      id: uid(),
      type: txType,
      amount,
      description: txDescription.trim(),
      category: txCategory
    });
    
    setTxAmount('');
    setTxDescription('');
  };

  const { income, expense, balance } = totals(dayData);

  const colorMap = {
    blue: 'bg-accent/10 border-accent',
    green: 'bg-finance-income/10 border-finance-income',
    purple: 'bg-accent-2/10 border-accent-2',
    orange: 'bg-orange-500/10 border-orange-500',
    red: 'bg-finance-expense/10 border-finance-expense',
    yellow: 'bg-finance-important/10 border-finance-important'
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-5 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setActiveDay(null)}>
      <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 pt-6">
          <h2 className="text-lg font-bold text-text-primary">{dayLabel(activeDay)}</h2>
          <div className="flex gap-2 items-center">
            <button className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${dayData.important ? 'border-finance-important bg-finance-important/15 text-finance-important shadow-[0_0_8px_rgba(210,153,34,0.3)]' : 'border-white/10 text-text-muted hover:border-finance-important hover:bg-finance-important/10'}`} onClick={() => toggleHighlight(activeDay)} title="Marcar importante">
              <Star className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-secondary hover:bg-finance-expense/15 hover:text-finance-expense hover:border-finance-expense transition-all" onClick={() => setActiveDay(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 px-5 pt-2">
          <button className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${activeTab === 'agenda' ? 'bg-accent/20 border-accent text-accent' : 'bg-bg-tertiary border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'}`} onClick={() => setActiveTab('agenda')}>
            <CalendarDays className="w-4 h-4" /> Agenda
          </button>
          <button className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${activeTab === 'finance' ? 'bg-accent/20 border-accent text-accent' : 'bg-bg-tertiary border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'}`} onClick={() => setActiveTab('finance')}>
            <DollarSign className="w-4 h-4" /> Finanzas
          </button>
        </div>

        {activeTab === 'agenda' && (
          <div className="block">
            <div className="p-5 pb-4 border-b border-white/10">
              <div className="flex gap-2 mb-2.5">
                <input type="time" className="flex-1 bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" value={taskTime} onChange={e => setTaskTime(e.target.value)} />
                <input type="time" className="flex-1 bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" value={taskEndTime} onChange={e => setTaskEndTime(e.target.value)} />
              </div>
              <div className="flex gap-2 mb-2.5">
                <input type="text" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" placeholder="¿Qué vas a hacer?" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTask()} />
              </div>
              <div className="flex gap-2 mb-2.5">
                <select className="flex-1 bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" value={taskColor} onChange={e => setTaskColor(e.target.value)}>
                  <option value="blue">🔵 Trabajo</option>
                  <option value="green">🟢 Personal</option>
                  <option value="purple">🟣 Estudio</option>
                  <option value="orange">🟠 Salud</option>
                  <option value="red">🔴 Urgente</option>
                  <option value="yellow">🟡 Recordatorio</option>
                </select>
                <input type="text" className="flex-1 bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" placeholder="Nota (opcional)" value={taskNote} onChange={e => setTaskNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTask()} />
              </div>
              <button className="w-full mt-1.5 py-3 bg-gradient-to-br from-accent to-accent-2 text-white rounded-xl text-sm font-bold shadow-[0_4px_16px_rgba(88,166,255,0.25)] hover:shadow-[0_6px_24px_rgba(88,166,255,0.25)] hover:opacity-90 hover:-translate-y-px transition-all flex items-center justify-center gap-2" onClick={handleSaveTask}>
                <Plus className="w-4 h-4" /> Agregar a la agenda
              </button>
            </div>

            <div className="py-2.5 max-h-[340px] overflow-y-auto">
              {Array.from({ length: 24 }).map((_, h) => {
                const isNow = isToday && h === nowH;
                const hourTasks = (dayData.tasks || []).filter(t => parseInt(t.start) === h);

                return (
                  <div key={h} className="flex items-start min-h-[48px] relative">
                    <div className="w-[46px] shrink-0 text-[11px] font-semibold text-text-muted px-2 pt-1 text-right select-none">
                      {String(h).padStart(2, '0')}:00
                    </div>
                    <div className={`flex-1 border-t border-white/10 mt-2 relative min-h-[40px] px-2 py-1 flex flex-col gap-1 ${isNow ? 'border-t-2 border-t-accent' : ''}`} ref={isNow ? nowRef : null}>
                      {isNow && <div className="absolute -left-1.5 -top-1.5 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_6px_#58a6ff]"></div>}
                      
                      {hourTasks.map(task => (
                        <div key={task.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-l-[3px] transition-opacity ${colorMap[task.color || 'blue']} ${task.done ? 'opacity-45 line-through' : 'hover:opacity-85'}`}>
                          <span className="text-[10px] font-bold text-text-muted shrink-0">{task.start}–{task.end}</span>
                          <span className="text-xs font-semibold text-text-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{task.title}</span>
                          
                          <button className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.done ? 'bg-finance-income/20 border-finance-income text-finance-income' : 'border-white/20 text-text-muted hover:border-finance-income hover:text-finance-income'}`} onClick={() => toggleTask(activeDay, task.id)} title={task.done ? 'Marcar pendiente' : 'Completar'}>
                            {task.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <button className="shrink-0 p-1 rounded text-text-muted hover:bg-finance-expense/20 hover:text-finance-expense transition-colors" onClick={() => deleteTask(activeDay, task.id)} title="Eliminar">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="block">
            <div className="grid grid-cols-3 gap-2 px-5 pt-4">
              <div className="bg-finance-income/10 rounded-xl p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">Ingresos</span>
                <span className="block text-sm font-extrabold text-finance-income">{fmt(income)}</span>
              </div>
              <div className="bg-finance-expense/10 rounded-xl p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">Gastos</span>
                <span className="block text-sm font-extrabold text-finance-expense">{fmt(expense)}</span>
              </div>
              <div className="bg-accent/10 rounded-xl p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">Balance</span>
                <span className="block text-sm font-extrabold text-accent">{fmt(balance)}</span>
              </div>
            </div>

            <div className="px-5 pt-3 flex flex-col gap-1.5">
              {(dayData.transactions || []).length === 0 ? (
                <p className="text-xs text-text-muted text-center p-2">Sin transacciones aún</p>
              ) : (
                dayData.transactions.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3.5 bg-bg-card border border-white/10 rounded-xl p-3.5 transition-all hover:border-white/20">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-finance-income/10 text-finance-income' : 'bg-finance-expense/10 text-finance-expense'}`}>
                      {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-text-primary leading-tight">{tx.description || 'Sin descripción'}</div>
                      <div className="text-[11px] text-text-secondary mt-0.5">{tx.category || '—'}</div>
                    </div>
                    <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-finance-income' : 'text-finance-expense'}`}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                    </div>
                    <button className="text-text-muted hover:text-finance-expense hover:bg-finance-expense/10 p-1.5 rounded-lg transition-colors" onClick={() => deleteTransaction(activeDay, tx.id)} title="Eliminar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-5">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Agregar transacción</h3>
              <div className="flex gap-2 mb-2.5">
                <select className="flex-1 bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" value={txType} onChange={e => setTxType(e.target.value)}>
                  <option value="income">💚 Ingreso</option>
                  <option value="expense">🔴 Gasto</option>
                </select>
                <input type="number" className="flex-1 bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" placeholder="Monto" min="0" step="0.01" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
              </div>
              <div className="flex gap-2 mb-2.5">
                <input type="text" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" placeholder="Descripción (ej: Salario, Comida...)" value={txDescription} onChange={e => setTxDescription(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTx()} />
              </div>
              <div className="flex gap-2 mb-2.5">
                <select className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" value={txCategory} onChange={e => setTxCategory(e.target.value)}>
                  <option value="">Selecciona categoría</option>
                  <option value="🍕 Alimentación">🍕 Alimentación</option>
                  <option value="🚗 Transporte">🚗 Transporte</option>
                  <option value="🏠 Vivienda">🏠 Vivienda</option>
                  <option value="💊 Salud">💊 Salud</option>
                  <option value="🎓 Educación">🎓 Educación</option>
                  <option value="🎮 Entretenimiento">🎮 Entretenimiento</option>
                  <option value="💼 Trabajo">💼 Trabajo</option>
                  <option value="💰 Inversión">💰 Inversión</option>
                  <option value="🎁 Regalo">🎁 Regalo</option>
                  <option value="📦 Otros">📦 Otros</option>
                </select>
              </div>
              <button className="w-full mt-1.5 py-3 bg-gradient-to-br from-accent to-accent-2 text-white rounded-xl text-sm font-bold shadow-[0_4px_16px_rgba(88,166,255,0.25)] hover:shadow-[0_6px_24px_rgba(88,166,255,0.25)] hover:opacity-90 hover:-translate-y-px transition-all" onClick={handleSaveTx}>Guardar transacción</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
