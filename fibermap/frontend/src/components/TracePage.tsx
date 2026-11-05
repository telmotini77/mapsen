import { useEffect, useId, useRef, useState } from 'react';
import { Layers, Search, X } from 'lucide-react';
import { apiFetch, apiJson, apiList } from '../lib/api';
import { fiberColorHex, fiberColorLabel, serviceText, textOnColor } from '../lib/fiberColors';
import { fiberCountLabel, readJson } from '../lib/network';
import './FiberTable.css';
import './TracePage.css';
import DismissibleAlert from './DismissibleAlert';

type OriginKind = 'ODF' | 'MANGA' | 'NAP';

interface TableFiber {
  id: string;
  number: number;
  color: string;
  status: string;
  service: string | null;
}

interface TableBuffer {
  number: number;
  color: string;
  fibers: TableFiber[];
}

interface TableCable {
  cableId: string;
  code: string;
  name: string | null;
  fiberCount: number;
  role: string;
  fiberFrom: number;
  fiberTo: number;
  buffers: TableBuffer[];
}

interface OriginTable {
  device: { id: string; code: string; name: string | null; status: string };
  cables: TableCable[];
}

interface DeviceConnection {
  id: string;
  role: string;
  fiberFrom: number;
  fiberTo: number;
  element: { kind: string; id: string; code: string; name: string | null } | null;
}

// Una fila por cada (cable, caja NAP) al que el origen llega: no importa por cuál de sus cables sale
// cada una, todas las NAP conectadas al mismo ODF o manga cuentan por igual.
interface NapLink {
  cableId: string;
  cableCode: string;
  fiberCount: number;
  napId: string;
  napLabel: string;
  napRole: string;
  napFrom: number;
  napTo: number;
}

interface OriginOption {
  id: string;
  code: string;
  name: string | null;
  kind: OriginKind;
}

const ROLE_LABELS: Record<string, string> = { START: 'Inicio', PASS: 'De paso', END: 'Final' };
const ORIGIN_LABELS: Record<OriginKind, string> = { ODF: 'ODF', MANGA: 'Manga', NAP: 'Caja NAP' };
const ENDPOINT_BY_KIND: Record<OriginKind, string> = { ODF: 'odfs', MANGA: 'boxes', NAP: 'boxes' };
const ORIGIN_THE: Record<OriginKind, string> = { ODF: 'el ODF', MANGA: 'la manga', NAP: 'la caja NAP' };

interface TracePageProps {
  initialBoxId?: string | null;
  initialDeviceKind?: string | null;
  onConsumeInitialBoxId?: () => void;
}

// Traza de fibra: desde un ODF, una manga o una caja NAP hacia las cajas NAP a las que llega (una NAP
// también puede continuar hacia otra NAP). El origen puede tener varios cables saliendo de él, cada
// uno hacia una NAP (o hacia una manga) distinta; para elegir el destino no importa por cuál cable sale cada NAP, así que
// primero se elige la caja NAP (entre todas las que el origen alcanza, sin importar el cable) y solo
// después se resuelve o se elige el cable y el hilo concretos de esa conexión.
export default function TracePage({ initialBoxId, initialDeviceKind, onConsumeInitialBoxId }: TracePageProps) {
  const [searching, setSearching] = useState(false);
  const [allOrigins, setAllOrigins] = useState<OriginOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [origin, setOrigin] = useState<OriginOption | null>(null);
  const [originTable, setOriginTable] = useState<OriginTable | null>(null);
  const [links, setLinks] = useState<NapLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [selectedNapId, setSelectedNapId] = useState('');
  const [selectedCableId, setSelectedCableId] = useState('');
  const [selectedFiber, setSelectedFiber] = useState<number | ''>('');
  const [result, setResult] = useState<NapLink | null>(null);
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

  // Junta, de TODOS los cables del origen (no solo uno), las cajas NAP a las que cada uno llega.
  const loadLinks = async (table: OriginTable, originId: string) => {
    setLinksLoading(true);
    setLinks([]);
    try {
      const perCable = await Promise.all(
        table.cables.map(async (cable) => {
          try {
            const inspection = await apiJson<{ deviceConnections: DeviceConnection[] }>(`/cables/${cable.cableId}/inspection`, {}, 'No se pudo consultar un cable');
            return inspection.deviceConnections
              .filter((c) => c.element?.kind === 'NAP' && c.element.id !== originId)
              .map((c): NapLink => ({
                cableId: cable.cableId,
                cableCode: cable.code,
                fiberCount: cable.fiberCount,
                napId: c.element!.id,
                napLabel: c.element!.name || c.element!.code,
                napRole: c.role,
                napFrom: c.fiberFrom,
                napTo: c.fiberTo,
              }));
          } catch {
            return [] as NapLink[];
          }
        }),
      );
      setLinks(perCable.flat());
    } finally {
      setLinksLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedNapId('');
    setSelectedCableId('');
    setSelectedFiber('');
    setResult(null);
    setRegistered(false);
  };

  const loadOrigin = async (id: string, kind: OriginKind) => {
    setLoading(true);
    setError(null);
    try {
      const [device, table] = await Promise.all([
        apiJson<any>(`/${ENDPOINT_BY_KIND[kind]}/${id}`, {}, `No se pudo cargar ${ORIGIN_THE[kind]}`),
        apiJson<OriginTable>(`/${ENDPOINT_BY_KIND[kind]}/${id}/table`, {}, `No se pudo cargar ${ORIGIN_THE[kind]}`),
      ]);
      setOrigin({ id: device.id, code: device.code, name: device.name, kind });
      setOriginTable(table);
      setSearching(false);
      resetSelection();
      loadLinks(table, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el origen');
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

  // Una entrada por caja NAP alcanzable (sin repetir), sin importar por cuál cable llega cada una.
  const napOptions: { napId: string; napLabel: string }[] = [];
  for (const link of links) {
    if (!napOptions.some((n) => n.napId === link.napId)) napOptions.push({ napId: link.napId, napLabel: link.napLabel });
  }
  // Los cables por los que se puede llegar a la NAP elegida (normalmente uno solo).
  const cableOptionsForNap = links.filter((l) => l.napId === selectedNapId);
  const selectedLink = cableOptionsForNap.find((l) => l.cableId === selectedCableId) ?? null;
  const selectedCable = originTable?.cables.find((c) => c.cableId === selectedCableId) ?? null;
  // Hilos que le tocan al origen en ese cable, acotados además al rango que le toca a la NAP elegida.
  const fiberOptions = selectedLink
    ? (selectedCable?.buffers.flatMap((b) => b.fibers) ?? []).filter((f) => f.number >= selectedLink.napFrom && f.number <= selectedLink.napTo)
    : [];

  const selectNap = (napId: string) => {
    setSelectedNapId(napId);
    const candidates = links.filter((l) => l.napId === napId);
    // Si solo hay un cable posible hacia esa NAP, se elige solo; si hay varios, que el usuario elija.
    setSelectedCableId(candidates.length === 1 ? candidates[0].cableId : '');
    setSelectedFiber('');
    setResult(null);
    setRegistered(false);
  };

  const selectCableForNap = (cableId: string) => {
    setSelectedCableId(cableId);
    setSelectedFiber('');
    setResult(null);
    setRegistered(false);
  };

  const handleTrace = () => {
    if (!selectedLink || selectedFiber === '') return;
    setError(null);
    setRegistered(false);
    setResult(selectedFiber >= selectedLink.napFrom && selectedFiber <= selectedLink.napTo ? selectedLink : null);
  };

  const serviceLabelFor = (link: NapLink) => `TO ${link.napLabel.toUpperCase()}`;

  // Deja constancia de la conexión confirmada en el propio hilo (Servicio): así aparece en la
  // "Tabla de conexiones" tanto del origen como de la caja NAP, porque las dos leen el mismo hilo.
  const registerConnection = async () => {
    if (!origin || !result || selectedFiber === '') return;
    const fiber = fiberOptions.find((f) => f.number === selectedFiber);
    if (!fiber) return;
    setRegistering(true);
    setError(null);
    try {
      await readJson(
        await apiFetch(`/fibers/${fiber.id}/configuration`, {
          method: 'PATCH',
          body: JSON.stringify({ label: serviceLabelFor(result), status: 'USED' }),
        }),
        'No se pudo registrar la conexión',
      );
      const table = await apiJson<OriginTable>(`/${ENDPOINT_BY_KIND[origin.kind]}/${origin.id}/table`, {}, 'No se pudo actualizar la tabla de conexiones');
      setOriginTable(table);
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
        <p>Desde un ODF, una manga o una caja NAP, sigue un hilo hasta las cajas NAP a las que llega (por cualquiera de sus cables).</p>
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
              <button className="btn-secondary" onClick={openSearch} aria-label="Cambiar de origen">
                <Search size={14} aria-hidden="true" /> Cambiar origen
              </button>
            </div>

            {error && <DismissibleAlert className="trace-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}

            {originTable && originTable.cables.length === 0 ? (
              <p className="muted">{ORIGIN_LABELS[origin.kind]} sin ninguna fibra conectada todavía.</p>
            ) : linksLoading ? (
              <p className="muted">Buscando a qué cajas NAP llega...</p>
            ) : napOptions.length === 0 ? (
              <p className="muted">Todavía no llega a ninguna caja NAP (puede que sus cables lleguen a otro dispositivo).</p>
            ) : (
              <>
                <div className="trace-form">
                  <label className="visually-hidden" htmlFor="trace-nap-select">Caja NAP de destino</label>
                  <select id="trace-nap-select" value={selectedNapId} onChange={(e) => selectNap(e.target.value)}>
                    <option value="">Selecciona una caja NAP...</option>
                    {napOptions.map((nap) => (
                      <option key={nap.napId} value={nap.napId}>{nap.napLabel}</option>
                    ))}
                  </select>
                </div>

                {selectedNapId && (
                  <div className="trace-form">
                    <label className="visually-hidden" htmlFor="trace-cable-select">Cable por el que llega</label>
                    <select id="trace-cable-select" value={selectedCableId} onChange={(e) => selectCableForNap(e.target.value)} disabled={cableOptionsForNap.length <= 1}>
                      {cableOptionsForNap.length > 1 && <option value="">Selecciona un cable...</option>}
                      {cableOptionsForNap.map((link) => (
                        <option key={link.cableId} value={link.cableId}>
                          {link.cableCode} · {fiberCountLabel(link.fiberCount)} · hilos {link.napFrom} a {link.napTo}
                        </option>
                      ))}
                    </select>
                    {cableOptionsForNap.length > 1 && <span className="muted">Esta NAP se puede alcanzar por {cableOptionsForNap.length} cables distintos.</span>}
                  </div>
                )}

                <div className="trace-form">
                  <label className="visually-hidden" htmlFor="trace-fiber-select">Hilo del cable</label>
                  <select
                    id="trace-fiber-select"
                    value={selectedFiber}
                    onChange={(e) => { setSelectedFiber(e.target.value === '' ? '' : Number(e.target.value)); setResult(null); setRegistered(false); }}
                    disabled={!selectedLink}
                  >
                    <option value="">{!selectedNapId ? 'Elige primero una caja NAP' : !selectedLink ? 'Elige un cable' : 'Selecciona un hilo...'}</option>
                    {fiberOptions.map((fiber) => (
                      <option key={fiber.number} value={fiber.number}>
                        Hilo {String(fiber.number).padStart(2, '0')} · {fiberColorLabel(fiber.color)} · {serviceText(fiber.service, fiber.status)}
                      </option>
                    ))}
                  </select>
                  <button className="btn-primary" onClick={handleTrace} disabled={!selectedLink || selectedFiber === ''}>
                    Trazar
                  </button>
                </div>
              </>
            )}

            {result && (
              <div className="trace-result" role="status">
                <p className="trace-summary">
                  Conexión confirmada con <strong>{result.napLabel}</strong>:
                </p>
                <div className="fiber-table-wrap">
                  <table className="fiber-table">
                    <caption className="visually-hidden">Caja NAP a la que llega el hilo seleccionado</caption>
                    <thead>
                      <tr>
                        <th scope="col">Hilo</th>
                        <th scope="col">Caja NAP</th>
                        <th scope="col">Cable</th>
                        <th scope="col">Rol</th>
                        <th scope="col">Rango en esa caja</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const fiber = fiberOptions.find((f) => f.number === selectedFiber);
                        const style = fiber ? { backgroundColor: fiberColorHex(fiber.color), color: textOnColor(fiber.color) } : undefined;
                        return (
                          <tr>
                            <td className="fiber-table-hilo" style={style}>{selectedFiber}</td>
                            <td className="fiber-table-service" style={style}>{result.napLabel}</td>
                            <td className="fiber-table-port">{result.cableCode}</td>
                            <td className="fiber-table-port">{ROLE_LABELS[result.napRole] ?? result.napRole}</td>
                            <td className="fiber-table-port">{result.napFrom} a {result.napTo}</td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
                {(() => {
                  const currentFiber = fiberOptions.find((f) => f.number === selectedFiber);
                  const alreadyRegistered = currentFiber?.service === serviceLabelFor(result);
                  return (
                    <div className="trace-register">
                      <button type="button" className="btn-primary" onClick={registerConnection} disabled={registering || alreadyRegistered}>
                        {alreadyRegistered ? 'Conexión ya registrada' : registering ? 'Registrando...' : 'Registrar esta conexión'}
                      </button>
                      {registered && <span className="muted">Se guardó como servicio del hilo: ya aparece en la tabla de conexiones del origen y de la caja NAP.</span>}
                    </div>
                  );
                })()}
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
