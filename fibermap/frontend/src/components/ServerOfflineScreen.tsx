import { useEffect, useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { pingServer } from '../lib/api';
import './ServerOfflineScreen.css';

interface ServerOfflineScreenProps {
  onRetry: () => void | Promise<void>;
}

// Pantalla que se muestra cuando hay una sesión guardada pero el servidor no responde.
// Reintenta sola cada pocos segundos y se puede reintentar a mano.
export default function ServerOfflineScreen({ onRetry }: ServerOfflineScreenProps) {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (await pingServer()) onRetry();
    }, 5000);
    return () => clearInterval(timer);
  }, [onRetry]);

  const retryNow = async () => {
    setChecking(true);
    await onRetry();
    setChecking(false);
  };

  return (
    <main className="server-offline" role="alert">
      <WifiOff size={40} aria-hidden="true" />
      <h1>Sin conexión con el servidor</h1>
      <p>
        No se pudo llegar al backend de FiberMap. Tu sesión sigue guardada: en cuanto el servidor vuelva a estar
        disponible se restablecerá sola.
      </p>
      <button type="button" className="btn-primary" onClick={retryNow} disabled={checking}>
        <RefreshCw size={16} aria-hidden="true" className={checking ? 'server-offline-spin' : ''} />
        {checking ? ' Comprobando...' : ' Reintentar ahora'}
      </button>
    </main>
  );
}
