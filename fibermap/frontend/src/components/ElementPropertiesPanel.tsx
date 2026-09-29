import { useEffect, useId, useRef } from 'react';
import { X, Edit, GitPullRequest, Link as LinkIcon, Table2, Trash2 } from 'lucide-react';
import { ELEMENT_LABELS, MANGA_TYPE_LABELS, describeElement, hasInterior, type NetworkElement } from '../lib/network';
import './ElementPropertiesPanel.css';

interface ElementPropertiesPanelProps {
  element: NetworkElement | null;
  onClose: () => void;
  onOpenEditor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewConnections: () => void;
  // Abre la tabla de conexiones del elemento (puerto · hilo · buffer · servicio): "Tabla de
  // puertos" en un ODF, "Tabla de conexiones" en una manga o caja NAP.
  onViewConnectionsTable?: () => void;
}

export function ElementPropertiesPanel({
  element,
  onClose,
  onOpenEditor,
  onEdit,
  onDelete,
  onViewConnections,
  onViewConnectionsTable,
}: ElementPropertiesPanelProps) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!element) return;
    closeBtnRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [element, onClose]);

  if (!element) return null;

  const { raw } = element;
  const splitters: { code: string; ratio: string }[] = raw.splitters ?? [];

  return (
    <div className="properties-panel" role="region" aria-labelledby={titleId}>
      <div className="panel-header">
        <h3 id={titleId}>{element.name || element.code}</h3>
        <button
          ref={closeBtnRef}
          className="close-btn icon-button"
          onClick={onClose}
          aria-label="Cerrar panel de propiedades"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="panel-content">
        <div className="prop-row">
          <span className="prop-label">Tipo:</span>
          <span className="prop-value type-badge">{ELEMENT_LABELS[element.kind]}</span>
        </div>

        {element.kind === 'MANGA' && (
          <div className="prop-row">
            <span className="prop-label">Manga:</span>
            <span className="prop-value">{MANGA_TYPE_LABELS[raw.mangaType] ?? '—'}</span>
          </div>
        )}

        <div className="prop-row">
          <span className="prop-label">Estado:</span>
          <span className="prop-value status-badge active">{element.status}</span>
        </div>

        <div className="prop-row">
          <span className="prop-label">Detalle:</span>
          <span className="prop-value">{describeElement(element)}</span>
        </div>

        {splitters.length > 0 && (
          <div className="prop-row">
            <span className="prop-label">Splitters:</span>
            <span className="prop-value">{splitters.map((s) => `${s.code} (${s.ratio})`).join(', ')}</span>
          </div>
        )}

        <div className="prop-row">
          <span className="prop-label">Ubicación:</span>
          <span className="prop-value coords">
            {Number.isFinite(element.lat) ? element.lat.toFixed(5) : '—'}<br/>
            {Number.isFinite(element.lng) ? element.lng.toFixed(5) : '—'}
          </span>
        </div>
      </div>

      <div className="panel-actions">
        <button className="action-btn" onClick={onEdit} aria-label="Editar elemento">
          <Edit size={16} aria-hidden="true" /> Editar
        </button>
        {onViewConnectionsTable && (
          <button
            className="action-btn primary"
            onClick={onViewConnectionsTable}
            aria-label={element.kind === 'ODF' ? 'Ver la tabla de puertos del ODF' : 'Ver la tabla de conexiones'}
          >
            <Table2 size={16} aria-hidden="true" /> {element.kind === 'ODF' ? 'Tabla de puertos' : 'Tabla de conexiones'}
          </button>
        )}
        {hasInterior(element) && (
          <button className="action-btn primary" onClick={onOpenEditor} aria-label="Abrir editor de conexiones">
            <GitPullRequest size={16} aria-hidden="true" /> Editor de conexiones
          </button>
        )}
        <button className="action-btn" onClick={onViewConnections} aria-label="Ver trazabilidad del elemento">
          <LinkIcon size={16} aria-hidden="true" /> Trazabilidad
        </button>
        <button className="action-btn danger" onClick={onDelete} aria-label="Eliminar elemento">
          <Trash2 size={16} aria-hidden="true" /> Eliminar
        </button>
      </div>
    </div>
  );
}
