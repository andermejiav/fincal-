import { useState, useEffect } from 'react';
import { todayKey } from '../utils/helpers';
import { FinanceContext } from './financeContext';

// Proveedor del contexto que envuelve la aplicación
export const FinanceProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [viewMonth, setViewMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [activeDay, setActiveDay] = useState(null); // Día seleccionado para el modal
  const [agendaDay, setAgendaDay] = useState(todayKey()); // Día seleccionado para la vista Agenda
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar', 'summary', 'transactions', 'agenda'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDefaults, setAddModalDefaults] = useState({});
  
  // Cargar datos desde localStorage al montar
  useEffect(() => {
    try {
      const localData = JSON.parse(localStorage.getItem('fincal_data') || '{}');
      setData(localData);
    } catch {
      setData({});
    }
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('fincal_data', JSON.stringify(data));
  }, [data]);

  // Obtiene los datos de un día, asegurando que tenga la estructura correcta
  const getDayData = (k) => {
    if (!data[k]) return { important: false, transactions: [], tasks: [] };
    const dayData = { ...data[k] };
    if (!dayData.tasks) dayData.tasks = [];
    if (!dayData.transactions) dayData.transactions = [];
    return dayData;
  };

  // Muestra un mensaje flotante (toast)
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Agregar una tarea a un día específico
  const addTask = (key, task) => {
    setData(prev => {
      const day = prev[key] || { important: false, transactions: [], tasks: [] };
      const tasks = day.tasks || [];
      return { ...prev, [key]: { ...day, tasks: [...tasks, task] } };
    });
    showToast('🗓️ Tarea agregada');
  };

  // Alternar el estado "completado" de una tarea
  const toggleTask = (key, id) => {
    setData(prev => {
      const day = prev[key];
      if (!day) return prev;
      const tasks = day.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
      return { ...prev, [key]: { ...day, tasks } };
    });
  };

  // Eliminar una tarea
  const deleteTask = (key, id) => {
    setData(prev => {
      const day = prev[key];
      if (!day) return prev;
      const tasks = day.tasks.filter(t => t.id !== id);
      return { ...prev, [key]: { ...day, tasks } };
    });
    showToast('Tarea eliminada');
  };

  // Agregar una transacción
  const addTransaction = (key, tx) => {
    setData(prev => {
      const day = prev[key] || { important: false, transactions: [], tasks: [] };
      const transactions = day.transactions || [];
      return { ...prev, [key]: { ...day, transactions: [...transactions, tx] } };
    });
    showToast(tx.type === 'income' ? '💚 Ingreso guardado' : '🔴 Gasto guardado');
  };

  // Eliminar una transacción
  const deleteTransaction = (key, txId) => {
    setData(prev => {
      const day = prev[key];
      if (!day) return prev;
      const transactions = day.transactions.filter(t => t.id !== txId);
      return { ...prev, [key]: { ...day, transactions } };
    });
    showToast('Transacción eliminada');
  };

  // Alternar el estado "importante" de un día
  const toggleHighlight = (key) => {
    setData(prev => {
      const day = prev[key] || { important: false, transactions: [], tasks: [] };
      const isImportant = !day.important;
      showToast(isImportant ? '⭐ Día marcado como importante' : 'Marca eliminada');
      return { ...prev, [key]: { ...day, important: isImportant } };
    });
  };

  return (
    <FinanceContext.Provider value={{
      data, getDayData,
      viewMonth, setViewMonth,
      activeDay, setActiveDay,
      agendaDay, setAgendaDay,
      currentView, setCurrentView,
      sidebarOpen, setSidebarOpen,
      toastMsg,
      addModalOpen, setAddModalOpen, addModalDefaults, setAddModalDefaults,
      addTask, toggleTask, deleteTask,
      addTransaction, deleteTransaction, toggleHighlight
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
