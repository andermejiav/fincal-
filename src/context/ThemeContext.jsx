import { useState, useEffect, useCallback } from 'react';
import { PRESETS } from './themeConstants';
import { ThemeContext } from './themeContext';

// Aplica un objeto de variables CSS al :root
function applyVars(vars) {
  Object.entries(vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

export const ThemeProvider = ({ children }) => {
  const [activePreset, setActivePreset] = useState('default');
  const [customVars, setCustomVars] = useState({});
  const [themePanelOpen, setThemePanelOpen] = useState(false);

  // Cargar tema guardado
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fincal_theme') || '{}');
      if (saved.presetId) setActivePreset(saved.presetId);
      if (saved.customVars) setCustomVars(saved.customVars);
      const preset = PRESETS.find(p => p.id === (saved.presetId || 'default')) || PRESETS[0];
      applyVars({ ...preset.vars, ...(saved.customVars || {}) });
    } catch {
      applyVars(PRESETS[0].vars);
    }
  }, []);

  // Aplicar paleta predefinida
  const applyPreset = useCallback((presetId) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setActivePreset(presetId);
    setCustomVars({});
    applyVars(preset.vars);
    localStorage.setItem('fincal_theme', JSON.stringify({ presetId, customVars: {} }));
  }, []);

  // Cambiar un color individual
  const setCustomVar = useCallback((key, value) => {
    setCustomVars(prev => {
      const next = { ...prev, [key]: value };
      document.documentElement.style.setProperty(key, value);
      localStorage.setItem('fincal_theme', JSON.stringify({ presetId: activePreset, customVars: next }));
      return next;
    });
  }, [activePreset]);

  // Resetear al tema por defecto
  const resetTheme = useCallback(() => {
    applyPreset('default');
  }, [applyPreset]);

  // Valor actual de una variable (custom override o valor del preset activo)
  const getVar = useCallback((key) => {
    if (customVars[key]) return customVars[key];
    const preset = PRESETS.find(p => p.id === activePreset) || PRESETS[0];
    return preset.vars[key] || '';
  }, [customVars, activePreset]);

  return (
    <ThemeContext.Provider value={{
      activePreset, customVars,
      themePanelOpen, setThemePanelOpen,
      applyPreset, setCustomVar, resetTheme, getVar,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
