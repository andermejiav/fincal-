// ── Utilidades ──────────────────────────────────────────────
// Formatea un número como moneda (Pesos Colombianos por defecto, o el formato que prefieras)
export function fmt(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

// Formatea un número a su versión corta (ej. $1.5M, $10k)
export function fmtShort(n) {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'k';
  return '$' + Math.round(n);
}

// Genera una clave de fecha en formato YYYY-MM-DD
export function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Obtiene la clave de fecha del día de hoy
export function todayKey() {
  const today = new Date();
  return dateKey(today.getFullYear(), today.getMonth(), today.getDate());
}

// Analiza una clave de fecha devolviendo un objeto {y, m, d}
export function parseKey(k) {
  if (!k || typeof k !== 'string') {
    const today = new Date();
    return { y: today.getFullYear(), m: today.getMonth(), d: today.getDate() };
  }
  const [y, m, d] = k.split('-').map(Number);
  return { y, m: m - 1, d };
}

// Devuelve el nombre del mes de una fecha
export function monthName(date) {
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
}

// Devuelve la etiqueta del día (ej. Lunes, 7 de julio de 2026)
export function dayLabel(k) {
  const { y, m, d } = parseKey(k);
  return new Date(y, m, d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());
}

// Genera un ID único para tareas y transacciones
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Calcula los totales de ingresos, gastos y balance de un día específico
export function totals(dd) {
  if (!dd) return { income: 0, expense: 0, balance: 0 };
  let income = 0, expense = 0;
  (dd.transactions || []).forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') income += amt; else expense += amt;
  });
  return { income, expense, balance: income - expense };
}
