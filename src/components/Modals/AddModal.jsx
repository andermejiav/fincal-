import { useContext, useState, useEffect, useCallback } from 'react';
import { FinanceContext } from '../../context/financeContext';
import { dateKey, uid } from '../../utils/helpers';
import { X, Check, CalendarDays, DollarSign } from 'lucide-react';

export default function AddModal() {
  const { addTransaction, addTask, addModalOpen, setAddModalOpen, addModalDefaults, setAddModalDefaults, showToast } = useContext(FinanceContext);
  
  const [activeTab, setActiveTab] = useState('transaction');
  const [txDate, setTxDate] = useState('');
  const [txType, setTxType] = useState('income');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState('');

  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('08:00');
  const [taskEndTime, setTaskEndTime] = useState('09:00');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskColor, setTaskColor] = useState('blue');
  const [taskNote, setTaskNote] = useState('');

  const close = useCallback(() => {
    setAddModalOpen(false);
    if (setAddModalDefaults) setAddModalDefaults({});
  }, [setAddModalOpen, setAddModalDefaults]);

  const notify = useCallback((msg) => {
    if (showToast) {
      showToast(msg);
    } else {
      alert(msg);
    }
  }, [showToast]);

  useEffect(() => {
    if (addModalOpen) {
      const today = new Date();
      const key = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
      const defDate = addModalDefaults?.date || key;
      const defTime = addModalDefaults?.time || '08:00';
      const endH = parseInt(defTime, 10) + 1 > 23 ? 23 : parseInt(defTime, 10) + 1;
      setTxDate(defDate);
      setTxType('income');
      setTxAmount('');
      setTxDescription('');
      setTxCategory('');
      setTaskDate(defDate);
      setTaskTime(defTime);
      setTaskEndTime(`${String(endH).padStart(2, '0')}:00`);
      setTaskTitle('');
      setTaskColor('blue');
      setTaskNote('');
      setActiveTab(addModalDefaults?.tab || 'transaction');
    }
  }, [addModalOpen, addModalDefaults]);

  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    if (!addModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addModalOpen, close]);

  if (!addModalOpen) return null;

  const handleSaveTx = () => {
    if (!txDate) {
      notify('⚠️ Selecciona una fecha');
      return;
    }
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) {
      notify('⚠️ Ingresa un monto válido');
      return;
    }
    
    const [y, m, d] = txDate.split('-').map(Number);
    const key = dateKey(y, m - 1, d);
    
    addTransaction(key, {
      id: uid(),
      type: txType,
      amount,
      description: txDescription.trim(),
      category: txCategory
    });
    
    close();
  };

  const handleSaveTask = () => {
    if (!taskDate) {
      notify('⚠️ Selecciona una fecha');
      return;
    }
    if (!taskTitle.trim()) {
      notify('⚠️ Escribe el nombre del evento');
      return;
    }
    
    const [y, m, d] = taskDate.split('-').map(Number);
    const key = dateKey(y, m - 1, d);
    
    addTask(key, {
      id: uid(),
      start: taskTime,
      end: taskEndTime,
      title: taskTitle.trim(),
      color: taskColor,
      note: taskNote.trim(),
      done: false
    });
    
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-5 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-[450px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-bg-secondary z-10">
          <h2 className="text-lg font-bold text-text-primary">Nuevo</h2>
          <button className="w-8 h-8 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-secondary hover:bg-finance-expense/15 hover:text-finance-expense hover:border-finance-expense transition-all" onClick={close}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-4">
          <button className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${activeTab === 'transaction' ? 'bg-accent/20 border-accent text-accent' : 'bg-bg-tertiary border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'}`} onClick={() => setActiveTab('transaction')}>
            <DollarSign className="w-4 h-4" /> Transacción
          </button>
          <button className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${activeTab === 'event' ? 'bg-accent/20 border-accent text-accent' : 'bg-bg-tertiary border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'}`} onClick={() => setActiveTab('event')}>
            <CalendarDays className="w-4 h-4" /> Evento
          </button>
        </div>

        {activeTab === 'transaction' && (
          <div className="p-5">
            <div className="mb-3">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Fecha</label>
              <input type="date" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all [color-scheme:dark]" value={txDate} onChange={e => setTxDate(e.target.value)} />
            </div>
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-1">Tipo</label>
                <select className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" value={txType} onChange={e => setTxType(e.target.value)}>
                  <option value="income">💚 Ingreso</option>
                  <option value="expense">🔴 Gasto</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-1">Monto</label>
                <input type="number" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" placeholder="Monto" min="0" step="0.01" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Descripción</label>
              <input type="text" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" placeholder="Descripción" value={txDescription} onChange={e => setTxDescription(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTx()} />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Categoría</label>
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
            <button className="w-full py-3 bg-gradient-to-br from-accent to-accent-2 text-white rounded-xl text-sm font-bold shadow-[0_4px_16px_rgba(88,166,255,0.25)] hover:shadow-[0_6px_24px_rgba(88,166,255,0.25)] hover:opacity-90 hover:-translate-y-px transition-all flex items-center justify-center gap-2" onClick={handleSaveTx}>
              <Check className="w-4 h-4" /> Guardar transacción
            </button>
          </div>
        )}

        {activeTab === 'event' && (
          <div className="p-5">
            <div className="mb-3">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Fecha</label>
              <input type="date" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all [color-scheme:dark]" value={taskDate} onChange={e => setTaskDate(e.target.value)} />
            </div>
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-1">Inicio</label>
                <input type="time" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" value={taskTime} onChange={e => setTaskTime(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-1">Fin</label>
                <input type="time" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" value={taskEndTime} onChange={e => setTaskEndTime(e.target.value)} />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Título de la actividad</label>
              <input type="text" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" placeholder="¿Qué vas a hacer?" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTask()} autoFocus />
            </div>
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-1">Categoría</label>
                <select className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" value={taskColor} onChange={e => setTaskColor(e.target.value)}>
                  <option value="blue">🔵 Trabajo</option>
                  <option value="green">🟢 Personal</option>
                  <option value="purple">🟣 Estudio</option>
                  <option value="orange">🟠 Salud</option>
                  <option value="red">🔴 Urgente</option>
                  <option value="yellow">🟡 Recordatorio</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-1">Nota (opcional)</label>
                <input type="text" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" placeholder="Nota..." value={taskNote} onChange={e => setTaskNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTask()} />
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-br from-accent to-accent-2 text-white rounded-xl text-sm font-bold shadow-[0_4px_16px_rgba(88,166,255,0.25)] hover:shadow-[0_6px_24px_rgba(88,166,255,0.25)] hover:opacity-90 hover:-translate-y-px transition-all flex items-center justify-center gap-2" onClick={handleSaveTask}>
              <Check className="w-4 h-4" /> Guardar evento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
