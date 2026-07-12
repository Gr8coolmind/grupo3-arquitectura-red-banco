import { useState } from 'react';
import { PresentationMode } from './components/PresentationMode';
import { InteractiveMode } from './components/InteractiveMode';

type AppMode = 'interactive' | 'presentation';

function ModeToggle({
  mode,
  onToggle,
}: {
  mode: AppMode;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl ${
        mode === 'interactive'
          ? 'gradient-navy text-white border border-gold/30 hover:shadow-gold/20'
          : 'bg-surface text-navy border border-navy/20 hover:shadow-navy/20'
      }`}
      title={mode === 'interactive' ? 'Entrar en Modo Presentación' : 'Volver al Dashboard'}
    >
      {mode === 'interactive' ? (
        <>
          <span className="text-lg">📊</span>
          <span>Modo Presentación</span>
        </>
      ) : (
        <>
          <span className="text-lg">🗺️</span>
          <span>Modo Explorar</span>
        </>
      )}
    </button>
  );
}

function App() {
  const [mode, setMode] = useState<AppMode>('interactive');

  const enterPresentation = () => setMode('presentation');
  const exitPresentation = () => setMode('interactive');
  const toggleMode = () => setMode(m => m === 'interactive' ? 'presentation' : 'interactive');

  return (
    <>
      {mode === 'presentation' ? (
        <PresentationMode onExit={exitPresentation} />
      ) : (
        <InteractiveMode onStartPresentation={enterPresentation} />
      )}

      {/* Fixed mode toggle button */}
      <ModeToggle mode={mode} onToggle={toggleMode} />
    </>
  );
}

export default App;
