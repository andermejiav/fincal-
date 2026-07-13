import { useContext, useState, useEffect } from 'react';
import { FinanceContext } from '../../context/FinanceContext';
import { dateKey, uid } from '../../utils/helpers';
import { X, Check } from 'lucide-react';

export default function AddModal({ isOpen, onClose }) {
  const { addTransaction } = useContext(FinanceContext);
  
  const [txDate, setTxDate] = useState('');
  const [txType, setTxType] = useState('income');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setTxDate(dateKey(today.getFullYear(), today.getMonth(), today.getDate()));
      setTxType('income');
      setTxAmount('');
      setTxDescription('');
      setTxCategory('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveTx = () => {
    if (!txDate) return alert('Selecciona una fecha');
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) return alert('Ingresa un monto válido');
    
    const [y, m, d] = txDate.split('-').map(Number);
    const key = dateKey(y, m - 1, d);
    
    addTransaction(key, {
      id: uid(),
      type: txType,
      amount,
      description: txDescription.trim(),
      category: txCategory
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-5 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-[450px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-text-primary">Nueva Transacción</h2>
          <button className="w-8 h-8 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-secondary hover:bg-finance-expense/15 hover:text-finance-expense hover:border-finance-expense transition-all" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="mb-3">
            <input type="date" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all [color-scheme:dark]" value={txDate} onChange={e => setTxDate(e.target.value)} />
          </div>
          <div className="flex gap-2 mb-3">
            <select className="flex-1 bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" value={txType} onChange={e => setTxType(e.target.value)}>
              <option value="income">💚 Ingreso</option>
              <option value="expense">🔴 Gasto</option>
            </select>
            <input type="number" className="flex-1 bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" placeholder="Monto" min="0" step="0.01" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
          </div>
          <div className="mb-3">
            <input type="text" className="w-full bg-bg-tertiary border border-white/10 text-text-primary rounded-lg px-3.5 py-2.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all" placeholder="Descripción" value={txDescription} onChange={e => setTxDescription(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTx()} />
          </div>
          <div className="mb-4">
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
            <Check className="w-4 h-4" /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
