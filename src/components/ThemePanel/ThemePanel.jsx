import { useContext } from 'react';
import { ThemeContext } from '../../context/themeContext';
import { PRESETS, CUSTOM_VARS } from '../../context/themeConstants';
import { X, RotateCcw, Palette, Check } from 'lucide-react';

// Agrupa las variables personalizables por su grupo
const grouped = CUSTOM_VARS.reduce((acc, v) => {
  if (!acc[v.group]) acc[v.group] = [];
  acc[v.group].push(v);
  return acc;
}, {});

export default function ThemePanel() {
  const { themePanelOpen, setThemePanelOpen, activePreset, applyPreset, setCustomVar, getVar, resetTheme } =
    useContext(ThemeContext);

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] transition-opacity duration-300 ${
          themePanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setThemePanelOpen(false)}
      />

      {/* Panel deslizante desde la derecha */}
      <aside
        className={`fixed top-0 right-0 h-full w-[320px] bg-[var(--color-bg-secondary)] border-l border-white/10 z-[1200] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          themePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="text-base font-bold text-[var(--color-text-primary,#e6edf3)]">
              Apariencia
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              title="Restablecer colores"
              onClick={resetTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-[var(--color-text-secondary,#8b949e)] hover:border-white/30 hover:text-[var(--color-text-primary,#e6edf3)] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setThemePanelOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-[var(--color-text-secondary,#8b949e)] hover:border-[var(--color-finance-expense,#f85149)] hover:text-[var(--color-finance-expense,#f85149)] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">

          {/* Paletas predefinidas */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted,#484f58)] mb-3">
              Temas predefinidos
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(preset => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                      isActive
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    {/* Muestra de colores del preset */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <div className="flex gap-0.5">
                        <span
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ background: preset.vars['--color-accent'] }}
                        />
                        <span
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ background: preset.vars['--color-accent-2'] }}
                        />
                      </div>
                      <div className="flex gap-0.5">
                        <span
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ background: preset.vars['--color-finance-income'] }}
                        />
                        <span
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ background: preset.vars['--color-finance-expense'] }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] leading-none mb-0.5">{preset.emoji}</span>
                      <span className="text-xs font-semibold text-[var(--color-text-primary,#e6edf3)] truncate">
                        {preset.name}
                      </span>
                    </div>

                    {isActive && (
                      <Check
                        className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-[var(--color-accent)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-white/10" />

          {/* Colores personalizados por grupo */}
          {Object.entries(grouped).map(([groupName, vars]) => (
            <div key={groupName}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted,#484f58)] mb-3">
                {groupName}
              </p>
              <div className="flex flex-col gap-3">
                {vars.map(({ key, label }) => {
                  const currentVal = getVar(key);
                  return (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[var(--color-text-secondary,#8b949e)] flex-1 min-w-0 truncate">
                        {label}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-[var(--color-text-muted,#484f58)] hidden sm:block">
                          {currentVal}
                        </span>
                        <label
                          className="relative w-9 h-9 rounded-xl cursor-pointer overflow-hidden border-2 border-white/15 hover:border-white/30 transition-all hover:scale-105 shadow-sm"
                          style={{ background: currentVal }}
                          title={`Cambiar ${label}`}
                        >
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            value={currentVal.startsWith('#') ? currentVal : '#58a6ff'}
                            onChange={e => setCustomVar(key, e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Footer info */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <p className="text-[11px] text-[var(--color-text-muted,#484f58)] text-center leading-relaxed">
              Los colores se guardan automáticamente en tu navegador.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
