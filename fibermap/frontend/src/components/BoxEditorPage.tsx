import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { GitPullRequest, Search, X, Trash2 } from 'lucide-react';
import { apiFetch, apiJson, apiList } from '../lib/api';
import { MANGA_TYPE_LABELS, readJson } from '../lib/network';
import { fiberColorLabel } from '../lib/fiberColors';
import './BoxEditorPage.css';
import DismissibleAlert from './DismissibleAlert';

interface BoxPort {
  id: string;
  number: number;
  type: string;
  status: string;
}

interface SplitterPort {
  id: string;
  portType: 'INPUT' | 'OUTPUT';
  number: number;
  status: string;
}

interface Splitter {
  id: string;
  code: string;
  ratio: string;
  inputCount: number;
  outputCount: number;
  ports: SplitterPort[];
}

interface BoxDetail {
  id: string;
  code: string;
  name: string | null;
  type: string;
  mangaType: string | null;
  capacity: number | null;
  ports: BoxPort[];
  splitters: Splitter[];
}

interface Termination {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
}

interface OpticalConnection {
  id: string;
  connectionType: string;
  lossDb: number | null;
  notes: string | null;
  sourceTermination: Termination;
  targetTermination: Termination;
  sourceFiber?: { id: string; number: number; color: string; label: string | null } | null;
  targetFiber?: { id: string; number: number; color: string; label: string | null } | null;
}

// Hilo de un cable conectado a esta caja (de su tabla de conexiones), para elegirlo en una fusión.
interface HiloOption {
  fiberId: string;
  label: string;
}

interface TerminalOption {
  refType: string; // BOX_PORT | SPLITTER_INPUT | SPLITTER_OUTPUT
  refId: string;
  label: string;
  status: string;
  splitterId?: string;
}

interface BoxEditorPageProps {
  initialBoxId?: string | null;
  onConsumeInitialBoxId?: () => void;
}

export default function BoxEditorPage({ initialBoxId, onConsumeInitialBoxId }: BoxEditorPageProps) {
  const [searching, setSearching] = useState(false);
  const [allBoxes, setAllBoxes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [box, setBox] = useState<BoxDetail | null>(null);
  const [connections, setConnections] = useState<OpticalConnection[]>([]);
  const [hiloOptions, setHiloOptions] = useState<HiloOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [portCount, setPortCount] = useState('4');

  const [sourceRef, setSourceRef] = useState('');
  const [targetRef, setTargetRef] = useState('');
  const [sourceFiberId, setSourceFiberId] = useState('');
  const [targetFiberId, setTargetFiberId] = useState('');
  const [expandedSplitters, setExpandedSplitters] = useState<Set<string>>(new Set());
  const searchTitleId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleSplitter = (id: string) => {
    setExpandedSplitters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openSearch = async () => {
    setSearching(true);
    try {
      setAllBoxes(await apiList('/boxes', 'No se pudieron cargar las cajas'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las cajas');
    }
  };

  const loadBox = async (boxId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [boxData, connData, table] = await Promise.all([
        apiJson(`/boxes/${boxId}`, {}, 'No se pudo cargar la caja'),
        apiList(`/optical-connections?boxId=${boxId}`, 'No se pudieron cargar las conexiones'),
        apiJson<{ cables: Array<{ code: string; buffers: Array<{ fibers: Array<{ id: string; number: number; color: string }> }> }> }>(
          `/boxes/${boxId}/table`, {}, 'No se pudieron cargar los hilos de la caja',
        ),
      ]);
      setBox(boxData);
      setConnections(connData);
      // Los hilos que llegan a esta caja salen de sus cables conectados (no hace falta asignarlos aparte).
      setHiloOptions(
        table.cables.flatMap((cable) =>
          cable.buffers.flatMap((buffer) =>
            buffer.fibers.map((fiber) => ({
              fiberId: fiber.id,
              label: `Hilo ${String(fiber.number).padStart(2, '0')} · ${fiberColorLabel(fiber.color)} · ${cable.code}`,
            })),
          ),
        ),
      );
      setSearching(false);
      setSourceRef('');
      setTargetRef('');
      setSourceFiberId('');
      setTargetFiberId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la caja');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    if (box) loadBox(box.id);
  };

  useEffect(() => {
    if (!searching) return;
    searchInputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearching(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searching]);

  useEffect(() => {
    if (initialBoxId) {
      loadBox(initialBoxId);
      onConsumeInitialBoxId?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBoxId]);

  const terminals: TerminalOption[] = useMemo(() => {
    if (!box) return [];
    const boxPorts: TerminalOption[] = box.ports.map((p) => ({
      refType: 'BOX_PORT',
      refId: p.id,
      label: `Puerto caja #${p.number} (${p.type}) — ${p.status}`,
      status: p.status,
    }));
    // Un splitter 1:8 tiene 8 puertos (1:16, 16), cada uno de entrada y salida: el antiguo puerto
    // común solo se lista si ya está en uso (dato anterior).
    const splitterPorts: TerminalOption[] = box.splitters.flatMap((s) =>
      s.ports.filter((p) => p.portType !== 'INPUT' || p.status !== 'FREE').map((p) => ({
        refType: p.portType === 'INPUT' ? 'SPLITTER_INPUT' : 'SPLITTER_OUTPUT',
        refId: p.id,
        // Todo puerto es de entrada y salida: se numeran seguidos (el lado común del splitter es el 1).
        label: `${s.code} · Puerto ${p.portType === 'INPUT' ? 'común (anterior)' : p.number} — ${p.status}`,
        status: p.status,
        splitterId: s.id,
      })),
    );
    return [...boxPorts, ...splitterPorts];
  }, [box]);

  // A splitter connects internally by design (1 input -> N outputs); manually fusing two of
  // its own ports together makes no physical sense, so origin/destination must always be two
  // different splitters (or a splitter and a plain box port).
  const sourceTerminal = terminals.find((t) => `${t.refType}::${t.refId}` === sourceRef);
  const targetTerminal = terminals.find((t) => `${t.refType}::${t.refId}` === targetRef);
  // En una caja NAP la fusión va de un puerto del splitter (origen) a un puerto DROP (destino).
  const isNapBox = box?.type === 'NAP';
  const dropPortIds = new Set((box?.ports ?? []).filter((p) => p.type === 'DROP').map((p) => p.id));
  const sourceOptions = isNapBox
    ? terminals.filter((t) => t.refType === 'SPLITTER_INPUT' || t.refType === 'SPLITTER_OUTPUT')
    : terminals.filter((t) => !targetTerminal?.splitterId || t.splitterId !== targetTerminal.splitterId);
  const targetOptions = isNapBox
    ? terminals.filter((t) => t.refType === 'BOX_PORT' && dropPortIds.has(t.refId))
    : terminals.filter((t) => !sourceTerminal?.splitterId || t.splitterId !== sourceTerminal.splitterId);

  const findTerminalLabel = (t: Termination) => {
    // Enlaces hilo → puerto hechos desde la tabla de conexiones: su origen es el hilo mismo.
    if (t.entityType === 'FIBER') return 'Hilo de la fibra';
    const match = terminals.find((opt) => opt.refType === t.entityType && opt.refId === t.entityId);
    return match?.label ?? `${t.entityType} (${t.entityId.slice(0, 8)})`;
  };

  const handleGeneratePorts = async () => {
    if (!box) return;
    const count = Number(portCount);
    if (!count || count < 1) return;
    try {
      await apiFetch(`/boxes/${box.id}/ports`, {
        method: 'POST',
        body: JSON.stringify({ count, type: 'DROP' }),
      });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Amplía el splitter de una NAP de 1:8 a 1:16: se agregan las 8 salidas nuevas y las existentes
  // conservan su estado y sus conexiones.
  const handleExpandSplitter = async (splitter: Splitter) => {
    setError(null);
    try {
      await readJson(
        await apiFetch(`/splitters/${splitter.id}`, { method: 'PATCH', body: JSON.stringify({ ratio: '1:16' }) }),
        'No se pudo ampliar el splitter',
      );
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo ampliar el splitter');
    }
  };

  // Un splitter con conexiones también se puede eliminar, pero con una confirmación que avisa que sus
  // fusiones se eliminarán con él (el backend solo lo hace con ?force=true).
  const handleDeleteSplitter = async (splitter: Splitter) => {
    const usedCount = splitter.ports.filter((p) => p.status !== 'FREE').length;
    const withConnectionsMessage = (detail: string) =>
      `El splitter ${splitter.code} (${splitter.ratio}) tiene conexiones: ${detail}\n\nSi lo eliminas, también se eliminarán esas fusiones y sus puertos quedarán libres. ¿Eliminarlo de todas formas?`;
    const confirmed = usedCount > 0
      ? window.confirm(withConnectionsMessage(`${usedCount} puerto(s) en uso.`))
      : window.confirm(`¿Eliminar el splitter ${splitter.code} (${splitter.ratio})?`);
    if (!confirmed) return;
    setError(null);
    try {
      const url = `/splitters/${splitter.id}`;
      let res = await apiFetch(usedCount > 0 ? `${url}?force=true` : url, { method: 'DELETE' });
      if (res.status === 409) {
        // Tenía fusiones que no se veían como puertos en uso: se pide confirmación antes de borrarlas.
        const body = await res.json().catch(() => ({}));
        if (!window.confirm(withConnectionsMessage(body.message ?? 'tiene fusiones activas.'))) return;
        res = await apiFetch(`${url}?force=true`, { method: 'DELETE' });
      }
      await readJson(res, 'No se pudo eliminar el splitter');
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el splitter');
    }
  };

  const handleCreateConnection = async () => {
    if (!box || !sourceRef || !targetRef) return;
    setError(null);
    const [sourceType, sourceId] = sourceRef.split('::');
    const [targetType, targetId] = targetRef.split('::');
    try {
      const res = await apiFetch('/optical-connections', {
        method: 'POST',
        body: JSON.stringify({
          boxId: box.id,
          sourceType,
          sourceId,
          targetType,
          targetId,
          sourceFiberId: sourceFiberId || undefined,
          targetFiberId: targetFiberId || undefined,
          connectionType: 'SPLICE',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo crear la fusión');
      }
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la fusión');
    }
  };

  const handleDeleteConnection = async (id: string) => {
    if (!window.confirm('¿Eliminar esta fusión?')) return;
    try {
      await apiFetch(`/optical-connections/${id}`, { method: 'DELETE' });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Una caja NAP suma como máximo 16 salidas de splitter: un 1:16, o uno o dos 1:8. Una manga de
  // distribución lleva un único splitter primario 1:8; las demás mangas no llevan splitter.
  const NAP_MAX_OUTPUTS = 16;
  const usedOutputs = (box?.splitters ?? []).reduce((sum, s) => sum + s.outputCount, 0);
  const addableRatios: string[] = !box
    ? []
    : box.type === 'NAP'
      ? ['1:8', '1:16'].filter((ratio) => usedOutputs + Number(ratio.split(':')[1]) <= NAP_MAX_OUTPUTS)
      : box.mangaType === 'DISTRIBUCION' && box.splitters.length === 0
        ? ['1:8']
        : [];
  const canExpand = (s: Splitter) => box?.type === 'NAP' && s.ratio === '1:8' && usedOutputs + 8 <= NAP_MAX_OUTPUTS;
  const splitterNotice =
    box?.type === 'NAP'
      ? `Una caja NAP puede tener un splitter 1:16, o uno o dos 1:8 (máximo ${NAP_MAX_OUTPUTS} salidas; usa ${usedOutputs}).`
      : box?.mangaType === 'DISTRIBUCION'
        ? 'Una manga de distribución lleva un único splitter primario 1:8.'
        : `Una manga ${MANGA_TYPE_LABELS[box?.mangaType ?? '']?.toLowerCase() ?? ''} no divide la señal: solo las mangas de distribución llevan splitter.`;

  const handleAddSplitter = async (ratio: string) => {
    if (!box) return;
    setError(null);
    try {
      await readJson(
        await apiFetch('/splitters', { method: 'POST', body: JSON.stringify({ boxId: box.id, ratio }) }),
        'No se pudo generar el splitter',
      );
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el splitter');
    }
  };

  const filteredBoxes = allBoxes.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      b.code?.toLowerCase().includes(term) ||
      b.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="view-panel">
      <header className="panel-header">
        <h2>Editor de Conexiones</h2>
        <p>Conecta hilos, splitters y patch cords dentro de una manga o caja NAP.</p>
      </header>

      <div className="editor-workspace">
        {!box && (
          <div className="empty-state">
            <GitPullRequest size={48} className="empty-icon" />
            <p>Selecciona una manga o caja NAP en el mapa para editar sus conexiones</p>
            <button className="btn-primary" onClick={openSearch}>
              Buscar Nodo
            </button>
          </div>
        )}

        {loading && <p className="editor-loading">Cargando...</p>}

        {box && !loading && (
          <div className="box-editor">
            <div className="box-editor-header">
              <div>
                <h3>{box.code}</h3>
                <span className="box-editor-type">
                  {box.type === 'MANGA'
                    ? `Manga ${MANGA_TYPE_LABELS[box.mangaType ?? '']?.toLowerCase() ?? ''} · ${box.capacity ?? '—'} hilos`
                    : 'Caja NAP'}
                </span>
              </div>
              <button className="btn-secondary" onClick={openSearch} aria-label="Cambiar de caja">
                <Search size={14} aria-hidden="true" /> Cambiar caja
              </button>
            </div>

            {error && <DismissibleAlert className="editor-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}

            <div className="box-editor-grid">
              <div className="box-editor-panel">
                <h4>Puertos de caja ({box.ports.length})</h4>
                {box.ports.length === 0 && <p className="muted">Esta caja no tiene puertos aún.</p>}
                <ul className="port-list" aria-label="Puertos de la caja">
                  {box.ports.map((p) => (
                    <li key={p.id} className={`port-item status-${p.status.toLowerCase()}`}>
                      #{p.number} · {p.type} · {p.status}
                    </li>
                  ))}
                </ul>
                <div className="labeled-form">
                  <label>
                    Cantidad de puertos
                    <input
                      type="number"
                      min={1}
                      value={portCount}
                      onChange={(e) => setPortCount(e.target.value)}
                    />
                  </label>
                  <button className="btn-secondary" onClick={handleGeneratePorts}>
                    Generar puertos
                  </button>
                </div>
              </div>

              <div className="box-editor-panel">
                <h4>Splitters ({box.splitters.length})</h4>
                {box.splitters.length === 0 && <p className="muted">Sin splitters instalados.</p>}
                <div className="splitter-accordion">
                  {box.splitters.map((s) => {
                    const expanded = expandedSplitters.has(s.id);
                    const usedCount = s.ports.filter((p) => p.status !== 'FREE').length;
                    return (
                      <div key={s.id} className="splitter-block">
                        <button
                          type="button"
                          className="splitter-block-header"
                          onClick={() => toggleSplitter(s.id)}
                          aria-expanded={expanded}
                          aria-controls={`splitter-ports-${s.id}`}
                        >
                          <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
                          <span>{s.code} ({s.ratio})</span>
                          <span className="muted">{usedCount}/{s.outputCount} en uso</span>
                        </button>
                        <div className="splitter-actions">
                          {canExpand(s) && (
                            <button type="button" className="btn-secondary splitter-expand" onClick={() => handleExpandSplitter(s)}>
                              Ampliar a 1:16 (+8 salidas)
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-secondary splitter-expand splitter-delete"
                            onClick={() => handleDeleteSplitter(s)}
                            title={usedCount > 0 ? 'Tiene conexiones: se eliminarán junto con el splitter' : undefined}
                          >
                            <Trash2 size={14} aria-hidden="true" /> Eliminar
                          </button>
                        </div>
                        {expanded && (
                          <ul className="port-list" id={`splitter-ports-${s.id}`} aria-label={`Puertos de ${s.code}`}>
                            {s.ports.filter((p) => p.portType !== 'INPUT' || p.status !== 'FREE').map((p) => (
                              <li key={p.id} className={`port-item status-${p.status.toLowerCase()}`}>
                                Puerto {p.portType === 'INPUT' ? 'común (anterior)' : p.number} · {p.status}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>

                {addableRatios.length > 0 && (
                  <div className="splitter-actions splitter-add">
                    {addableRatios.map((ratio) => (
                      <button key={ratio} type="button" className="btn-secondary splitter-expand" onClick={() => handleAddSplitter(ratio)}>
                        + Generar splitter {ratio}
                      </button>
                    ))}
                  </div>
                )}
                <p className="muted">{splitterNotice}</p>
              </div>
            </div>

            <div className="fusion-panel">
              <h4>Nueva fusión</h4>
              <div className="fusion-form">
                <label className="visually-hidden" htmlFor="fusion-source-select">Origen de la fusión</label>
                <select
                  id="fusion-source-select"
                  value={sourceRef}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSourceRef(value);
                    setSourceFiberId('');
                    const chosen = terminals.find((t) => `${t.refType}::${t.refId}` === value);
                    if (chosen?.splitterId && chosen.splitterId === targetTerminal?.splitterId) {
                      setTargetRef('');
                    }
                  }}
                >
                  <option value="">{isNapBox ? (sourceOptions.length ? 'Origen: puerto del splitter...' : 'Esta caja no tiene splitter') : 'Origen...'}</option>
                  {sourceOptions.map((t) => (
                    <option key={`src-${t.refType}-${t.refId}`} value={`${t.refType}::${t.refId}`}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <label className="visually-hidden" htmlFor="fusion-target-select">Destino de la fusión</label>
                <select
                  id="fusion-target-select"
                  value={targetRef}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTargetRef(value);
                    setTargetFiberId('');
                    const chosen = terminals.find((t) => `${t.refType}::${t.refId}` === value);
                    if (chosen?.splitterId && chosen.splitterId === sourceTerminal?.splitterId) {
                      setSourceRef('');
                    }
                  }}
                >
                  <option value="">{isNapBox ? (targetOptions.length ? 'Destino: puerto DROP...' : 'Genera primero los puertos DROP') : 'Destino...'}</option>
                  {targetOptions.map((t) => (
                    <option key={`dst-${t.refType}-${t.refId}`} value={`${t.refType}::${t.refId}`}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <label className="visually-hidden" htmlFor="fusion-source-fiber-select">Hilo de origen (opcional)</label>
                <select id="fusion-source-fiber-select" value={sourceFiberId} onChange={(e) => setSourceFiberId(e.target.value)}>
                  <option value="">{hiloOptions.length ? 'Hilo de origen (opcional)' : 'Esta caja aún no recibe hilos'}</option>
                  {hiloOptions.map((hilo) => <option key={hilo.fiberId} value={hilo.fiberId}>{hilo.label}</option>)}
                </select>
                <label className="visually-hidden" htmlFor="fusion-target-fiber-select">Hilo de destino (opcional)</label>
                <select id="fusion-target-fiber-select" value={targetFiberId} onChange={(e) => setTargetFiberId(e.target.value)}>
                  <option value="">{hiloOptions.length ? 'Hilo de destino (opcional)' : 'Esta caja aún no recibe hilos'}</option>
                  {hiloOptions.map((hilo) => <option key={hilo.fiberId} value={hilo.fiberId}>{hilo.label}</option>)}
                </select>
                <button
                  className="btn-primary"
                  onClick={handleCreateConnection}
                  disabled={!sourceRef || !targetRef}
                >
                  Conectar
                </button>
              </div>
              <p className="muted">
                {isNapBox
                  ? 'Une un puerto del splitter (origen) con un puerto DROP de la caja (destino); el hilo de cada lado es opcional (son los hilos de los cables que llegan a esta caja).'
                  : 'Elige los dos puertos que se unen; el hilo de cada lado es opcional (son los hilos de los cables que llegan a esta caja). El origen y el destino no pueden ser puertos del mismo splitter — un splitter reparte señal, no se conecta consigo mismo.'}
              </p>

              <h4>Conexiones activas ({connections.length})</h4>
              {connections.length === 0 ? (
                <p className="muted">Aún no hay fusiones registradas en esta caja.</p>
              ) : (
                <ul className="connection-list">
                  {connections.map((c) => (
                    <li key={c.id}>
                      <span>
                        {findTerminalLabel(c.sourceTermination)} ⟷ {findTerminalLabel(c.targetTermination)}
                        {(c.sourceFiber || c.targetFiber) && (
                          <small> · {c.sourceFiber ? `hilo ${c.sourceFiber.number}` : 'sin hilo'} ⟷ {c.targetFiber ? `hilo ${c.targetFiber.number}` : 'sin hilo'}</small>
                        )}
                      </span>
                      <button
                        className="btn-icon icon-button"
                        onClick={() => handleDeleteConnection(c.id)}
                        aria-label="Eliminar esta fusión"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {searching && (
        <div className="modal-backdrop" onClick={() => setSearching(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby={searchTitleId}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id={searchTitleId}>Buscar caja</h3>
              <button className="btn-icon icon-button" onClick={() => setSearching(false)} aria-label="Cerrar búsqueda">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <label className="visually-hidden" htmlFor="box-search-input">Buscar por código o nombre</label>
            <input
              id="box-search-input"
              ref={searchInputRef}
              className="modal-search"
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="modal-list" role="listbox" aria-label="Resultados de la búsqueda">
              {filteredBoxes.length === 0 && <li className="muted">No hay cajas registradas</li>}
              {filteredBoxes.map((b) => (
                <li key={b.id} role="option" aria-selected="false" tabIndex={0}
                  onClick={() => loadBox(b.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadBox(b.id); } }}
                >
                  <strong>{b.code}</strong> <span className="muted">{b.type === 'MANGA' ? `Manga ${MANGA_TYPE_LABELS[b.mangaType]?.toLowerCase() ?? ''}` : 'Caja NAP'}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
