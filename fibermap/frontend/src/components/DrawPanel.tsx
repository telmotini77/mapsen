import type { ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { useDraggablePanel } from '../lib/useDraggablePanel';
import './DragHandle.css';

interface DrawPanelProps {
  ariaLabel: string;
  title: string;
  children: ReactNode;
}

// Panel flotante del mapa (trazar o modificar una fibra): queda anclado a la derecha, se puede
// arrastrar desde su cabecera (o con las flechas del teclado) y recuerda dónde se dejó.
export default function DrawPanel({ ariaLabel, title, children }: DrawPanelProps) {
  const drag = useDraggablePanel('fibermap.drawPanel.position');
  return (
    <div ref={drag.panelRef} className="cable-draw-panel" style={drag.style} role="region" aria-label={ariaLabel}>
      <div className="modal-header-draggable draw-panel-header" title="Arrastra para mover · doble clic para volver a la derecha" {...drag.headerProps}>
        <button
          type="button"
          className="drag-handle"
          data-no-drag
          aria-label="Mover panel: usa las flechas del teclado (Mayús para mover más; Inicio para volver a la derecha)"
          {...drag.handleProps}
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
        <h4>{title}</h4>
      </div>
      {children}
    </div>
  );
}
