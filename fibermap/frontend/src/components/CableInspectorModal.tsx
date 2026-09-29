import { useEffect, useId, useState } from 'react';
import { ChevronDown, ChevronUp, Info, Link2, Maximize2, Pencil, RefreshCw, Route, Settings2, Trash2, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import EditEntityModal from './EditEntityModal';
import FiberConfigurationPanel from './FiberConfigurationPanel';
import FiberTable, { type FiberTableBuffer } from './FiberTable';
import { fiberColorLabel } from '../lib/fiberColors';
import {
  CONNECTION_ROLE_LABELS,
  CONNECTION_TYPES,
  ELEMENT_LABELS,
  CABLE_FIBER_COUNTS,
  fiberCountLabel,
  connectionSummary,
  readJson,
  type DeviceConnection,
} from '../lib/network';
import './CableInspectorModal.css';
import DismissibleAlert from './DismissibleAlert';

interface CableInspectorModalProps {
  cableId: string;
  onClose: () => void;
  // Cierra el inspector y activa el modo de edición del trazado en el mapa.
  onEditPath?: (cableId: string) => void;
  // Avisa al mapa que el color o las conexiones cambiaron para que se vuelva a dibujar.
  onChanged?: () => void;
  // false cuando el usuario desactivó la confirmación de acciones destructivas en Ajustes.
  confirmDelete?: boolean;
}

type Fiber = {
  id: string; number: number; numberInTube: number; color: string; label?: string | null;
  status: string; attenuationDbPerKm?: string | number | null; description?: string | null;
  tube: { number: number; color: string; label?: string | null };
  connections: Array<{ id: string; status: string; lengthMeters?: string | number | null; lossDb?: string | number | null; from: { id: string; label: string }; to: { id: string; label: string } }>;
};

type Inspection = {
  cable: { code: string; name?: string | null; type: string; color?: string; fiberCount: number; tubeCount: number; fibersPerTube: number; status: string; calculatedLengthMeters?: string | number | null };
  inventoryReady: boolean;
  deviceConnections: DeviceConnection[];
  fibers: Fiber[];
  connectedSplitters: Array<{
    id: string;
    code: string;
    name?: string | null;
    ratio: string;
    status: string;
    box: { code: string; name?: string | null } | null;
    linkedFibers: number[];
    linkedPorts: Array<{ type: string; number: number; status: string }>;
  }>;
};

interface AccordionHeaderProps {
  panelId: string;
  open: boolean;
  onToggle: () => void;
  eyebrow: string;
  title: string;
  count: number;
}

// Cabecera de una sección plegable: es un botón (aria-expanded) dentro de un encabezado, el patrón
// estándar de acordeón accesible.
function AccordionHeader({ panelId, open, onToggle, eyebrow, title, count }: AccordionHeaderProps) {
  return (
    <h3 className="cable-accordion-title">
      <button type="button" className="cable-accordion-toggle" onClick={onToggle} aria-expanded={open} aria-controls={panelId}>
        <span className="cable-accordion-text"><small>{eyebrow}</small><strong>{title}</strong></span>
        <span className="cable-accordion-count">{count}</span>
        {open ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
      </button>
    </h3>
  );
}

export default function CableInspectorModal({ cableId, onClose, onEditPath, onChanged, confirmDelete = true }: CableInspectorModalProps) {
  const titleId = useId();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [selectedFiberId, setSelectedFiberId] = useState<string | null>(null);
  const [expandTo, setExpandTo] = useState<number | null>(null);
  const [expanding, setExpanding] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [configuringFiberId, setConfiguringFiberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DeviceConnection | null>(null);
  // Secciones plegables: null = por defecto (cerradas, salvo Dispositivos cuando está vacía).
  const [devicesOpen, setDevicesOpen] = useState<boolean | null>(null);
  const [splittersOpen, setSplittersOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const response = await apiFetch(`/cables/${cableId}/inspection`);
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? 'No se pudo consultar el cable.');
      setInspection(body);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo consultar el cable.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [cableId]);
  useEffect(() => {
    // Con el formulario de una conexión abierto, Escape solo debe cerrar ese formulario.
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !editingConnection) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, editingConnection]);

  const deleteCable = async () => {
    const code = inspection?.cable.code ?? 'esta fibra';
    if (confirmDelete && !window.confirm(`¿Eliminar la fibra ${code}? Se quitará del mapa junto con sus conexiones con dispositivos.`)) return;
    setError(null);
    try {
      await readJson(await apiFetch(`/cables/${cableId}`, { method: 'DELETE' }), 'No se pudo eliminar la fibra.');
      onChanged?.();
      onClose();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la fibra.');
    }
  };

  const detectConnections = async () => {
    setError(null);
    try {
      await readJson(await apiFetch(`/cables/${cableId}/reconnect`, { method: 'POST' }), 'No se pudieron detectar las conexiones.');
      await load();
      onChanged?.();
    } catch (detectError) {
      setError(detectError instanceof Error ? detectError.message : 'No se pudieron detectar las conexiones.');
    }
  };

  const saveConnection = async (values: Record<string, any>) => {
    if (!editingConnection) return;
    const res = await apiFetch(`/cables/${cableId}/connections/${editingConnection.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        connectionType: values.connectionType,
        fiberFrom: Number(values.fiberFrom),
        fiberTo: Number(values.fiberTo),
        lossDb: values.lossDb === '' || values.lossDb == null ? undefined : Number(values.lossDb),
        notes: values.notes ?? '',
      }),
    });
    await readJson(res, 'No se pudo guardar la conexión.');
    setEditingConnection(null);
    await load();
    onChanged?.();
  };

  // Amplía la fibra a una capacidad mayor: los hilos que ya tiene conservan su número, estado,
  // servicio y conexiones; solo se agregan los buffers e hilos nuevos.
  const expandFiber = async (target: number) => {
    setExpanding(true); setError(null);
    try {
      await readJson(await apiFetch(`/cables/${cableId}`, { method: 'PATCH', body: JSON.stringify({ fiberCount: target }) }), 'No se pudo ampliar la fibra.');
      setExpandTo(null);
      await load();
      onChanged?.();
    } catch (expandError) {
      setError(expandError instanceof Error ? expandError.message : 'No se pudo ampliar la fibra.');
    } finally { setExpanding(false); }
  };

  // Cambia el nombre (código) de la fibra; no puede quedar vacío ni repetir el de otra fibra.
  const saveName = async () => {
    setSavingName(true); setError(null);
    try {
      await readJson(await apiFetch(`/cables/${cableId}`, { method: 'PATCH', body: JSON.stringify({ code: nameDraft.trim() }) }), 'No se pudo cambiar el nombre.');
      setRenaming(false);
      await load();
      onChanged?.();
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : 'No se pudo cambiar el nombre.');
    } finally { setSavingName(false); }
  };

  const initialize = async () => {
    setInitializing(true); setError(null);
    try {
      const response = await apiFetch(`/cables/${cableId}/fibers/initialize`, { method: 'POST' });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? 'No se pudo generar el inventario de hilos.');
      setInspection(body);
    } catch (initError) {
      setError(initError instanceof Error ? initError.message : 'No se pudo generar el inventario de hilos.');
    } finally { setInitializing(false); }
  };

  // Hilos agrupados por buffer, en el orden de la hoja de empalme.
  const fiberBuffers: FiberTableBuffer[] = [];
  for (const fiber of inspection?.fibers ?? []) {
    let buffer = fiberBuffers.find((item) => item.number === fiber.tube.number);
    if (!buffer) {
      buffer = { number: fiber.tube.number, color: fiber.tube.color, rows: [] };
      fiberBuffers.push(buffer);
    }
    buffer.rows.push({ id: fiber.id, number: fiber.number, color: fiber.color, status: fiber.status, service: fiber.label });
  }
  const selectedFiber = inspection?.fibers.find((fiber) => fiber.id === selectedFiberId) ?? null;

  return (
    <div className="cable-inspector-backdrop" onMouseDown={onClose}>
      <section className="cable-inspector-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()}>
        <header className="cable-inspector-header">
          <div>
            <p>Inspector de fibra</p>
            {renaming && inspection ? (
              <form className="cable-rename" onSubmit={(event) => { event.preventDefault(); saveName(); }}>
                <label className="visually-hidden" htmlFor="cable-rename-input">Nombre de la fibra</label>
                <input id="cable-rename-input" value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={80} autoFocus />
                <button type="submit" className="btn-primary" disabled={savingName || !nameDraft.trim()}>{savingName ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" className="btn-secondary" onClick={() => setRenaming(false)} disabled={savingName}>Cancelar</button>
              </form>
            ) : (
              <h2 id={titleId}>
                {inspection?.cable.code ?? 'Cargando cable...'}
                {inspection && (
                  <button type="button" className="btn-icon icon-button cable-rename-btn" onClick={() => { setNameDraft(inspection.cable.code); setRenaming(true); }} aria-label="Cambiar el nombre de la fibra" title="Cambiar el nombre">
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                )}
              </h2>
            )}
            <span>{inspection?.cable.name || 'Detalle de hilos y conexiones'}</span>
          </div>
          <button type="button" className="btn-icon icon-button" onClick={onClose} aria-label="Cerrar información del cable"><X size={19} /></button>
        </header>

        {loading && <p className="cable-inspector-loading">Consultando inventario de fibra...</p>}
        {error && <DismissibleAlert className="cable-inspector-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}
        {inspection && !loading && <>
          <div className="cable-inspector-summary">
            <div><small>Capacidad</small><strong>{fiberCountLabel(inspection.cable.fiberCount)}</strong></div>
            <div><small>Buffers</small><strong>{inspection.cable.tubeCount} × {inspection.cable.fibersPerTube}</strong></div>
            <div><small>Estado</small><strong>{inspection.cable.status}</strong></div>
            <div><small>Longitud</small><strong>{inspection.cable.calculatedLengthMeters ? `${Number(inspection.cable.calculatedLengthMeters).toFixed(1)} m` : '—'}</strong></div>
          </div>

          <section className="cable-appearance-section" aria-label="Apariencia y trazado">
            <div className="cable-path-actions">
              {onEditPath && (
                <button type="button" className="btn-secondary cable-edit-path" onClick={() => onEditPath(cableId)}>
                  <Route size={15} aria-hidden="true" /> Modificar trazado
                </button>
              )}
              <button type="button" className="btn-secondary cable-delete" onClick={deleteCable}>
                <Trash2 size={15} aria-hidden="true" /> Eliminar fibra
              </button>
            </div>
          </section>

          {(() => {
            const larger = CABLE_FIBER_COUNTS.filter((count) => count > inspection.cable.fiberCount);
            if (larger.length === 0) return null;
            const target = expandTo !== null && larger.some((count) => count === expandTo) ? expandTo : larger[0];
            return (
              <section className="cable-expand-section" aria-label="Ampliar hilos">
                <div>
                  <strong>Ampliar hilos</strong>
                  <p>
                    Los {inspection.cable.fiberCount} hilos actuales conservan su número, estado, servicio y conexiones; solo se agregan los nuevos.
                    {inspection.cable.fiberCount >= 24 && target === 48 && ' Al pasar a 48 los buffers son de 12, así que los hilos 7 al 24 se reagrupan.'}
                  </p>
                </div>
                <div className="cable-expand-controls">
                  <label className="visually-hidden" htmlFor="cable-expand-select">Nueva cantidad de hilos</label>
                  <select id="cable-expand-select" value={target} onChange={(event) => setExpandTo(Number(event.target.value))} disabled={expanding}>
                    {larger.map((count) => <option key={count} value={count}>{fiberCountLabel(count)}</option>)}
                  </select>
                  <button type="button" className="btn-secondary" onClick={() => expandFiber(target)} disabled={expanding}>
                    <Maximize2 size={15} aria-hidden="true" /> {expanding ? 'Ampliando...' : 'Ampliar'}
                  </button>
                </div>
              </section>
            );
          })()}

          <section className="cable-device-section" aria-label="Conexiones con dispositivos">
            <AccordionHeader
              panelId="cable-devices-panel"
              open={devicesOpen ?? inspection.deviceConnections.length === 0}
              onToggle={() => setDevicesOpen(!(devicesOpen ?? inspection.deviceConnections.length === 0))}
              eyebrow="Se conectan solas al pasar por su centro"
              title="Dispositivos conectados"
              count={inspection.deviceConnections.length}
            />
            {(devicesOpen ?? inspection.deviceConnections.length === 0) && (
              <div id="cable-devices-panel" className="cable-accordion-panel">
            {inspection.deviceConnections.length === 0 ? (
              <div className="cable-device-empty">
                <p className="cable-splitter-empty">Esta fibra no tiene dispositivos conectados todavía.</p>
                <button type="button" className="btn-secondary cable-device-configure" onClick={detectConnections}>
                  <RefreshCw size={14} aria-hidden="true" /> Detectar conexiones
                </button>
              </div>
            ) : (
              <ul className="cable-device-list">
                {inspection.deviceConnections.map((connection) => {
                  const label = connection.element ? `${ELEMENT_LABELS[connection.element.kind]} ${connection.element.code}` : 'Dispositivo eliminado';
                  return (
                    <li key={connection.id}>
                      <span className={`cable-role role-${connection.role.toLowerCase()}`}>{CONNECTION_ROLE_LABELS[connection.role]}</span>
                      <div>
                        <strong>{label}</strong>
                        <small>{connectionSummary(connection)}</small>
                        {connection.notes && <small>{connection.notes}</small>}
                      </div>
                      <button type="button" className="btn-secondary cable-device-configure" onClick={() => setEditingConnection(connection)} aria-label={`Configurar la conexión con ${label}`}>
                        <Settings2 size={14} aria-hidden="true" /> Configurar
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
              </div>
            )}
          </section>

          <section className="cable-splitter-section" aria-label="Splitters conectados">
            <AccordionHeader
              panelId="cable-splitters-panel"
              open={splittersOpen}
              onToggle={() => setSplittersOpen((prev) => !prev)}
              eyebrow="Topología asociada"
              title="Splitters conectados"
              count={inspection.connectedSplitters.length}
            />
            {splittersOpen && (
              <div id="cable-splitters-panel" className="cable-accordion-panel">
            {inspection.connectedSplitters.length === 0 ? (
              <p className="cable-splitter-empty">No hay splitters enlazados directamente a los hilos de este cable.</p>
            ) : (
              <ul className="cable-splitter-list">
                {inspection.connectedSplitters.map((splitter) => (
                  <li key={splitter.id}>
                    <div><strong>{splitter.code}</strong><span>{splitter.name || 'Sin nombre'} · {splitter.ratio}</span></div>
                    <div className="cable-splitter-meta">
                      <span>{splitter.box?.code ?? 'Caja no disponible'}</span>
                      <span>Hilos {splitter.linkedFibers.map((number) => String(number).padStart(2, '0')).join(', ')}</span>
                      <span>{splitter.linkedPorts.map((port) => `${port.type === 'INPUT' ? 'Entrada' : 'Salida'} ${port.number}`).join(', ')}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
              </div>
            )}
          </section>

          {!inspection.inventoryReady ? (
            <div className="cable-inspector-empty"><Info size={22} /><div><strong>Este cable no tiene inventario de hilos.</strong><p>Los cables creados antes de este módulo necesitan generar su estructura de tubos y fibras una sola vez.</p><button type="button" className="btn-primary" onClick={initialize} disabled={initializing}><RefreshCw size={15} className={initializing ? 'cable-inspector-spin' : ''} /> {initializing ? 'Generando...' : `Generar ${inspection.cable.fiberCount} hilos`}</button></div></div>
          ) : (
            <div className="cable-fiber-list" aria-label="Hilos del cable">
              <FiberTable
                caption={`Hilos de la fibra ${inspection.cable.code} agrupados por buffer`}
                buffers={fiberBuffers}
                selectedId={selectedFiber?.id ?? null}
                onSelectRow={(row) => { setSelectedFiberId(selectedFiberId === row.id ? null : row.id); setConfiguringFiberId(null); }}
              />
              {!selectedFiber && <p className="cable-fiber-hint">Toca un hilo para ver su detalle, sus conexiones y configurarlo.</p>}
              {selectedFiber && (
                <div className="cable-fiber-detail fiber-table-detail-panel">
                  <h4 className="cable-fiber-detail-title">
                    Hilo {String(selectedFiber.number).padStart(2, '0')} · {fiberColorLabel(selectedFiber.color)} · Buffer {selectedFiber.tube.number}
                  </h4>
                  <dl><div><dt>Servicio</dt><dd>{selectedFiber.label || 'Sin servicio asignado'}</dd></div><div><dt>Estado</dt><dd>{selectedFiber.status}</dd></div><div><dt>Posición</dt><dd>Buffer {selectedFiber.tube.number} · hilo {selectedFiber.numberInTube}</dd></div><div><dt>Atenuación</dt><dd>{selectedFiber.attenuationDbPerKm ?? '—'} dB/km</dd></div></dl>
                  {selectedFiber.description && <p className="cable-fiber-notes">{selectedFiber.description}</p>}
                  <div className="cable-fiber-connections"><strong><Link2 size={15} /> Conexiones registradas</strong>{selectedFiber.connections.length === 0 ? <p>Sin conexión registrada para este hilo.</p> : <ul>{selectedFiber.connections.map((connection) => <li key={connection.id}><span>{connection.from.label}</span><b>→</b><span>{connection.to.label}</span><small>{connection.status}{connection.lengthMeters ? ` · ${connection.lengthMeters} m` : ''}{connection.lossDb ? ` · ${connection.lossDb} dB` : ''}</small></li>)}</ul>}</div>
                  <button type="button" className="btn-secondary cable-fiber-configure" onClick={() => setConfiguringFiberId(selectedFiber.id)}><Settings2 size={15} /> Configurar hilo, servicio y terminales</button>
                  {configuringFiberId === selectedFiber.id && <FiberConfigurationPanel cableId={cableId} fiber={selectedFiber} onClose={() => setConfiguringFiberId(null)} onSaved={load} />}
                </div>
              )}
            </div>
          )}
        </>}
      {editingConnection && inspection && (
        <EditEntityModal
          title={`Conexión con ${editingConnection.element ? editingConnection.element.code : 'dispositivo eliminado'}`}
          initialValues={{ ...editingConnection, lossDb: editingConnection.lossDb ?? '', notes: editingConnection.notes ?? '' }}
          onClose={() => setEditingConnection(null)}
          onSave={saveConnection}
          fields={[
            { key: 'connectionType', label: 'Tipo de conexión', type: 'select', options: CONNECTION_TYPES },
            { key: 'fiberFrom', label: `Primer hilo conectado (1-${inspection.cable.fiberCount})`, type: 'number' },
            { key: 'fiberTo', label: `Último hilo conectado (1-${inspection.cable.fiberCount})`, type: 'number' },
            { key: 'lossDb', label: 'Pérdida estimada (dB)', type: 'number' },
            { key: 'notes', label: 'Notas' },
          ]}
        />
      )}
      </section>
    </div>
  );
}
