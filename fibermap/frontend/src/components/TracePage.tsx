import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Layers, RefreshCw, Search, X } from 'lucide-react';
import { apiFetch, apiJson, apiList } from '../lib/api';
import { fiberColorHex, fiberColorLabel, serviceText, textOnColor } from '../lib/fiberColors';
import { readJson } from '../lib/network';
import './FiberTable.css';
import './TracePage.css';
import DismissibleAlert from './DismissibleAlert';

type OriginKind = 'ODF' | 'MANGA' | 'NAP';

// Un paso del recorrido de un hilo (ver TraceService en el backend): en qué dispositivo y puerto está,
// por qué fibra e hilo, y si se llegó por la fibra o por una fusión.
interface TraceStep {
  id: number;
  parent: number | null;
  how: 'origin' | 'cable' | 'splice';
  deviceType: OriginKind;
  deviceId: string;
  deviceName: string;
  portLabel: string | null;
  fiberId: string;
  cableId: string;
  cableCode: string;
  fiberNumber: number;
  fiberColor: string;
}

interface TracedFiber {
  fiberId: string;
  cableId: string;
  cableCode: string;
  number: number;
  color: string;
  status: string;
  service: string | null;
  steps: TraceStep[];
}

interface OriginOption {
  id: string;
  code: string;
  name: string | null;
  kind: OriginKind;
}

const ORIGIN_LABELS: Record<OriginKind, string> = { ODF: 'ODF', MANGA: 'Manga', NAP: 'Caja NAP' };
const ORIGIN_THE: Record<OriginKind, string> = { ODF: 'el ODF', MANGA: 'la manga', NAP: 'la caja NAP' };
const HOW_LABELS: Record<TraceStep['how'], string> = { origin: 'Origen', cable: 'Por la fibra', splice: 'Fusión' };

interface TracePageProps {
  initialBoxId?: string | null;
  initialDeviceKind?: string | null;
  onConsumeInitialBoxId?: () => void;
  // Avisa qué dispositivo quedó abierto, para volver a él al regresar a esta sección.
  onDeviceOpened?: (id: string, kind: OriginKind) => void;
}

// Camino desde el origen hasta un paso (siguiendo los padres).
function pathTo(steps: TraceStep[], step: TraceStep) {
  const path: TraceStep[] = [];
  for (let current: TraceStep | undefined = step; current; current = current.parent === null ? undefined : steps[current.parent]) path.unshift(current);
  return path;
}

// Traza de fibra: desde un ODF, una manga o una caja NAP, sigue cada hilo por su fibra y por las
// fusiones registradas (tabla de conexiones, Editor de Conexiones y splitters) hasta las cajas NAP a
// las que llega. Usa los mismos datos que se editan en el mapa y en sus tablas.
export default function TracePage({ initialBoxId, initialDeviceKind, onConsumeInitialBoxId, onDeviceOpened }: TracePageProps) {
  const [searching, setSearching] = useState(false);
  const [allOrigins, setAllOrigins] = useState<OriginOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [origin, setOrigin] = useState<OriginOption | null>(null);
  const [fibers, setFibers] = useState<TracedFiber[] | null>(null);
  const [selectedNapId, setSelectedNapId] = useState('');
  const [selectedFiberId, setSelectedFiberId] = useState('');
  const [traced, setTraced] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTitleId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const openSearch = async () => {
    setSearching(true);
    try {
      const [boxes, odfs] = await Promise.all([
        apiList<any>('/boxes', 'No se pudieron cargar las cajas'),
        apiList<any>('/odfs', 'No se pudieron cargar los ODF'),
      ]);
      const options: OriginOption[] = [
        ...odfs.map((o): OriginOption => ({ id: o.id, code: o.code, name: o.name, kind: 'ODF' })),
        ...boxes.map((b): OriginOption => ({ id: b.id, code: b.code, name: b.name, kind: b.type === 'NAP' ? 'NAP' : 'MANGA' })),
      ].sort((a, b) => a.code.localeCompare(b.code));
      setAllOrigins(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los orígenes');
    }
  };

  const fetchTrace = (id: string, kind: OriginKind) =>
    apiJson<{ fibers: TracedFiber[] }>(`/trace/${kind === 'ODF' ? 'odf' : 'box'}/${id}`, {}, `No se pudo trazar ${ORIGIN_THE[kind]}`);

  const loadOrigin = async (id: string, kind: OriginKind) => {
    setLoading(true);
    setError(null);
    try {
      const [device, trace] = await Promise.all([
        apiJson<any>(`/${kind === 'ODF' ? 'odfs' : 'boxes'}/${id}`, {}, `No se pudo cargar ${ORIGIN_THE[kind]}`),
        fetchTrace(id, kind),
      ]);
      setOrigin({ id: device.id, code: device.code, name: device.name, kind });
      setFibers(trace.fibers);
      setSearching(false);
      setSelectedNapId('');
      setSelectedFiberId('');
      setTraced(false);
      setRegistered(false);
      onDeviceOpened?.(device.id, kind);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el origen');
    } finally {
      setLoading(false);
    }
  };

  // Vuelve a leer la traza (p. ej. después de cambiar fusiones en otra sección) sin perder lo elegido.
  const reload = async () => {
    if (!origin) return;
    setLoading(true);
    setError(null);
    try {
      setFibers((await fetchTrace(origin.id, origin.kind)).fibers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la traza');
    } finally {
      setLoading(false);
    }
  };

  // Punto de entrada desde el panel de un elemento del mapa: se abre con ese elemento como origen.
  const loadInitial = async (id: string, kind?: string | null) => {
    if (kind === 'ODF' || kind === 'MANGA' || kind === 'NAP') {
      await loadOrigin(id, kind);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const box = await apiJson<any>(`/boxes/${id}`, {}, 'No se pudo cargar el elemento');
      await loadOrigin(id, box.type === 'NAP' ? 'NAP' : 'MANGA');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el elemento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBoxId) {
      loadInitial(initialBoxId, initialDeviceKind);
      onConsumeInitialBoxId?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBoxId]);

  useEffect(() => {
    if (!searching) return;
    searchInputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearching(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searching]);

  // Pasos en que un hilo entra a una caja NAP (distinta del origen).
  const napArrivals = (fiber: TracedFiber) => fiber.steps.filter((step) => step.deviceType === 'NAP' && step.deviceId !== origin?.id);

  // Cajas NAP a las que llega algún hilo del origen (sin repetir), por cualquier fibra o fusión.
  const napOptions = useMemo(() => {
    const options: { napId: string; napLabel: string; fiberCount: number }[] = [];
    for (const fiber of fibers ?? []) {
      const reached = new Map(napArrivals(fiber).map((step) => [step.deviceId, step.deviceName]));
      for (const [napId, napLabel] of reached) {
        const existing = options.find((n) => n.napId === napId);
        if (existing) existing.fiberCount += 1;
        else options.push({ napId, napLabel, fiberCount: 1 });
      }
    }
    return options.sort((a, b) => a.napLabel.localeCompare(b.napLabel));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fibers, origin]);

  // Hilos del origen que llegan a la NAP elegida.
  const fiberOptions = (fibers ?? []).filter((fiber) => napArrivals(fiber).some((step) => step.deviceId === selectedNapId));
  const selectedFiber = fiberOptions.find((fiber) => fiber.fiberId === selectedFiberId) ?? null;
  const selectedNap = napOptions.find((nap) => nap.napId === selectedNapId) ?? null;
  // Un recorrido por cada vez que el hilo entra a esa NAP (normalmente uno).
  const routes = selectedFiber && traced
    ? napArrivals(selectedFiber).filter((step) => step.deviceId === selectedNapId).map((step) => pathTo(selectedFiber.steps, step))
    : [];

  const selectNap = (napId: string) => {
    setSelectedNapId(napId);
    const candidates = (fibers ?? []).filter((fiber) => napArrivals(fiber).some((step) => step.deviceId === napId));
    setSelectedFiberId(candidates.length === 1 ? candidates[0].fiberId : '');
    setTraced(false);
    setRegistered(false);
  };

  const serviceLabel = selectedNap ? `TO ${selectedNap.napLabel.toUpperCase()}` : '';

  // Deja constancia de la conexión confirmada en el propio hilo (Servicio): así aparece en la
  // "Tabla de conexiones" tanto del origen como de la caja NAP, porque las dos leen el mismo hilo.
  const registerConnection = async () => {
    if (!selectedFiber || !selectedNap) return;
    setRegistering(true);
    setError(null);
    try {
      await readJson(
        await apiFetch(`/fibers/${selectedFiber.fiberId}/configuration`, {
          method: 'PATCH',
          body: JSON.stringify({ label: serviceLabel, status: 'USED' }),
        }),
        'No se pudo registrar la conexión',
      );
      await reload();
      setRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la conexión');
    } finally {
      setRegistering(false);
    }
  };

  const filteredOrigins = allOrigins.filter((o) => {
    const term = searchTerm.toLowerCase();
    return !term || o.code?.toLowerCase().includes(term) || o.name?.toLowerCase().includes(term);
  });

  return (
    <div className="view-panel">
      <header className="panel-header">
        <h2>Trazabilidad de fibra</h2>
        <p>Desde un ODF, una manga o una caja NAP, sigue un hilo por sus fibras y fusiones hasta las cajas NAP a las que llega.</p>
      </header>

      <div className="trace-workspace">
        {error && !origin && <DismissibleAlert className="trace-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}
        {loading && !origin && <p className="editor-loading">Cargando...</p>}
        {!origin && !loading && (
          <div className="empty-state">
            <Layers size={48} className="empty-icon" />
            <p>Elige un ODF, una manga o una caja NAP para empezar</p>
            <button className="btn-primary" onClick={openSearch}>
              Nueva Traza
            </button>
          </div>
        )}

        {origin && (
          <div className="trace-panel">
            <div className="trace-header">
              <div>
                <h3>{origin.name || origin.code}</h3>
                <span className="box-editor-type">{ORIGIN_LABELS[origin.kind]}</span>
              </div>
              <div className="trace-header-actions">
                <button className="btn-secondary" onClick={reload} disabled={loading} aria-label="Actualizar la traza">
                  <RefreshCw size={14} aria-hidden="true" /> Actualizar
                </button>
                <button className="btn-secondary" onClick={openSearch} aria-label="Cambiar de origen">
                  <Search size={14} aria-hidden="true" /> Cambiar origen
                </button>
              </div>
            </div>

            {error && <DismissibleAlert className="trace-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}

            {loading ? (
              <p className="muted">Siguiendo los hilos por sus fibras y fusiones...</p>
            ) : fibers && fibers.length === 0 ? (
              <p className="muted">{ORIGIN_LABELS[origin.kind]} sin ninguna fibra conectada todavía.</p>
            ) : fibers && napOptions.length === 0 ? (
              <p className="muted">Ningún hilo llega todavía a una caja NAP. Revisa las fusiones en la tabla de conexiones o en el Editor de Conexiones.</p>
            ) : fibers && (
              <>
                <div className="trace-form">
                  <label className="visually-hidden" htmlFor="trace-nap-select">Caja NAP de destino</label>
                  <select id="trace-nap-select" value={selectedNapId} onChange={(e) => selectNap(e.target.value)}>
                    <option value="">Selecciona una caja NAP...</option>
                    {napOptions.map((nap) => (
                      <option key={nap.napId} value={nap.napId}>{nap.napLabel} · {nap.fiberCount} {nap.fiberCount === 1 ? 'hilo' : 'hilos'}</option>
                    ))}
                  </select>
                </div>

                <div className="trace-form">
                  <label className="visually-hidden" htmlFor="trace-fiber-select">Hilo del origen</label>
                  <select
                    id="trace-fiber-select"
                    value={selectedFiberId}
                    onChange={(e) => { setSelectedFiberId(e.target.value); setTraced(false); setRegistered(false); }}
                    disabled={!selectedNapId}
                  >
                    <option value="">{!selectedNapId ? 'Elige primero una caja NAP' : 'Selecciona un hilo...'}</option>
                    {fiberOptions.map((fiber) => (
                      <option key={fiber.fiberId} value={fiber.fiberId}>
                        {fiber.cableCode} · Hilo {String(fiber.number).padStart(2, '0')} · {fiberColorLabel(fiber.color)} · {serviceText(fiber.service, fiber.status)}
                      </option>
                    ))}
                  </select>
                  <button className="btn-primary" onClick={() => { setTraced(true); setRegistered(false); }} disabled={!selectedFiber}>
                    Trazar
                  </button>
                </div>
              </>
            )}

            {routes.length > 0 && selectedNap && selectedFiber && (
              <div className="trace-result" role="status">
                <p className="trace-summary">
                  Recorrido del hilo {selectedFiber.number} de {selectedFiber.cableCode} hasta <strong>{selectedNap.napLabel}</strong>:
                </p>
                {routes.map((route, index) => (
                  <div className="fiber-table-wrap" key={route[route.length - 1].id}>
                    <table className="fiber-table">
                      <caption className="visually-hidden">Recorrido {index + 1} hasta {selectedNap.napLabel}</caption>
                      <thead>
                        <tr>
                          <th scope="col">Paso</th>
                          <th scope="col">Dispositivo</th>
                          <th scope="col">Puerto</th>
                          <th scope="col">Fibra · hilo</th>
                          <th scope="col">Cómo llega</th>
                        </tr>
                      </thead>
                      <tbody>
                        {route.map((step, stepIndex) => {
                          const style = { backgroundColor: fiberColorHex(step.fiberColor), color: textOnColor(step.fiberColor) };
                          return (
                            <tr key={step.id}>
                              <td className="fiber-table-port">{stepIndex + 1}</td>
                              <td className="fiber-table-port">{ORIGIN_LABELS[step.deviceType]} {step.deviceName}</td>
                              <td className="fiber-table-port">{step.portLabel ?? '—'}</td>
                              <td className="fiber-table-hilo" style={style}>{step.cableCode} · hilo {step.fiberNumber}</td>
                              <td className="fiber-table-port">{HOW_LABELS[step.how]}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
                <div className="trace-register">
                  <button type="button" className="btn-primary" onClick={registerConnection} disabled={registering || selectedFiber.service === serviceLabel}>
                    {selectedFiber.service === serviceLabel ? 'Conexión ya registrada' : registering ? 'Registrando...' : 'Registrar esta conexión'}
                  </button>
                  {registered && <span className="muted">Se guardó como servicio del hilo: ya aparece en la tabla de conexiones del origen y de la caja NAP.</span>}
                </div>
              </div>
            )}
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
              <h3 id={searchTitleId}>Buscar ODF, manga o caja NAP</h3>
              <button className="btn-icon icon-button" onClick={() => setSearching(false)} aria-label="Cerrar búsqueda">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <label className="visually-hidden" htmlFor="trace-box-search-input">Buscar por código o nombre</label>
            <input
              id="trace-box-search-input"
              ref={searchInputRef}
              className="modal-search"
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="modal-list" role="listbox" aria-label="Resultados de la búsqueda">
              {filteredOrigins.length === 0 && <li className="muted">No hay ODF, mangas ni cajas NAP registrados</li>}
              {filteredOrigins.map((o) => (
                <li key={`${o.kind}-${o.id}`} role="option" aria-selected="false" tabIndex={0}
                  onClick={() => loadOrigin(o.id, o.kind)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadOrigin(o.id, o.kind); } }}
                >
                  <strong>{o.code}</strong> <span className="muted">{ORIGIN_LABELS[o.kind]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
