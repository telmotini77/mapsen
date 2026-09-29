import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import './DismissibleAlert.css';

interface DismissibleAlertProps {
  // Clase con el estilo (color, borde) propio de cada pantalla; el componente solo agrega la "X".
  className?: string;
  role?: 'alert' | 'status';
  onClose: () => void;
  children: ReactNode;
}

// Aviso que el usuario puede cerrar con la "X" (los errores y mensajes no se quedan
// en pantalla tapando contenido hasta que la pantalla se recargue).
export default function DismissibleAlert({ className = '', role = 'alert', onClose, children }: DismissibleAlertProps) {
  return (
    <div className={`${className} dismissible-alert`} role={role}>
      <span className="dismissible-alert-text">{children}</span>
      <button type="button" className="dismissible-alert-close" onClick={onClose} aria-label="Cerrar aviso" title="Cerrar">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
