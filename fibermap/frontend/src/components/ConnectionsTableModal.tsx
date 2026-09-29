import { Fragment, useCallback, useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { apiFetch, apiJson } from '../lib/api';
import { fiberCountLabel, readJson } from '../lib/network';
import { fiberColorHex, textOnColor } from '../lib/fiberColors';
import DismissibleAlert from './DismissibleAlert';
import FiberTable, { type FiberTableBuffer } from './FiberTable';
import ConnectDeviceModal from './ConnectDeviceModal';
import './OdfTableModal.css';

type DeviceKind = 'ODF' | 'MANGA' | 'NAP';

interface DeviceTerminal {
  key: string;
  group: string;
  label: string;
  status: string;
  // `linkId`: enlace hilo → puerto hecho desde esta tabla (se puede quitar con la ×).
  fibers: Array<{ fiberId: string; cableId: string; cableCode: string; number: number; color: string; linkId?: string }>;
  peers: string[];
  // A qué otro dispositivo sigue el hilo de este puerto (y en qué puerto entra allá, si se registró).
  remote?: Array<{ deviceType: DeviceKind; deviceId: string; deviceName: string; fiberNumber: number; cableCode: string; portLabel: string | null }>;
}

interface ConnectionsTable {
  device: { id: string; kind: DeviceKind; code: string; name: string | null; mangaType?: string | null; capacity: number | null; status: string };
  portsInUse: number;
  cables: Array<{
    cableId: string;
    code: string;
    name: string | null;
    fiberCount: number;
    role: string;
    fiberFrom: number;
    fiberTo: number;
    hasInventory: boolean;
    startNodeType: string | null;
    devices?: Array<{ type: DeviceKind; id: string; name: string; fiberFrom: number; fiberTo: number }>;
    buffers: Array<{
      number: number;
      color: string;
      fibers: Array<{ id: string; number: number; numberInTube: number; color: string; status: string; service: string | null; port: number; links?: string[] }>;
    }>;
  }>;
  // Lado derecho de la hoja: puertos del dispositivo y el hilo que entra en cada uno.
  terminals?: DeviceTerminal[];
}

interface ConnectionsTableModalProps {
  elementKind: DeviceKind;
  elementId: string;
  onClose: () => void;
}

const TITLE_BY_KIND: Record<DeviceKind, string> = { ODF: 'Tabla de puertos', MANGA: 'Tabla de conexiones', NAP: 'Tabla de conexiones' };
const CAPACITY_LABEL_BY_KIND: Record<DeviceKind, string> = { ODF: 'puertos', MANGA: 'hilos', NAP: 'salidas' };
const ENDPOINT_BY_KIND: Record<DeviceKind, string> = { ODF: 'odfs', MANGA: 'boxes', NAP: 'boxes' };
const KIND_LABEL: Record<DeviceKind, string> = { ODF: 'ODF', MANGA: 'Manga', NAP: 'Caja NAP' };

interface DeviceTableProps {
  kind: DeviceKind;
  name: string;
  terminals: DeviceTerminal[];
  // Con un hilo elegido en la tabla de la fibra, cada puerto se vuelve clicable para conectarlo.
  picking: boolean;
  busy: boolean;
  onPickTerminal: (terminal: DeviceTerminal) => void;
  onRemoveLink: (linkId: string, text: string) => void;
  onOpenConnect: (terminal: DeviceTerminal) => void;
}

// Tabla del dispositivo (derecha): cada puerto con el hilo que entra en él, agrupada por splitter o
// por puertos de la caja / del ODF. Es la contraparte de la columna "Puerto" de las tablas de fibra.
// Todo puerto es de entrada y salida: une hasta dos hilos, uno por cada lado.
const MAX_FIBERS_PER_PORT = 2;

// El puerto se pinta del color del hilo que tiene (como la celda Hilo de la tabla de la fibra); si une
// dos hilos de distinto color, mitad y mitad.
function portCellStyle(terminal: DeviceTerminal) {
  const [first, second] = terminal.fibers;
  if (!first) return undefined;
  const a = fiberColorHex(first.color);
  const b = second ? fiberColorHex(second.color) : a;
  return {
    background: a === b ? a : `linear-gradient(90deg, ${a} 0 50%, ${b} 50% 100%)`,
    color: textOnColor(first.color),
  };
}
function DeviceTable({ kind, name, terminals, picking, busy, onPickTerminal, onRemoveLink, onOpenConnect }: DeviceTableProps) {
  const groups = terminals.reduce<Array<{ name: string; items: DeviceTerminal[] }>>((acc, terminal) => {
    const last = acc[acc.length - 1];
    if (last && last.name === terminal.group) last.items.push(terminal);
    else acc.push({ name: terminal.group, items: [terminal] });
    return acc;
  }, []);
  const showPeers = true;
  return (
    <div className="fiber-table-wrap">
      <table className="fiber-table device-table">
        <caption className="visually-hidden">Puertos de {name}</caption>
        <thead>
          <tr>
            <th scope="col">Puerto</th>
            <th scope="col">Hilos que une</th>
            {showPeers && <th scope="col">Fusionado con</th>}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.name}>
              <tr className="device-table-group">
                <th scope="colgroup" colSpan={showPeers ? 3 : 2}>{group.name}</th>
              </tr>
              {group.items.map((terminal) => {
                const full = terminal.fibers.length >= MAX_FIBERS_PER_PORT;
                const pickable = picking && !full;
                return (
                <tr
                  key={terminal.key}
                  className={pickable ? 'device-table-pickable' : picking ? 'device-table-full' : undefined}
                  onClick={pickable && !busy ? () => onPickTerminal(terminal) : undefined}
                >
                  <td className="fiber-table-port device-table-port" style={portCellStyle(terminal)}>
                    {pickable ? (
                      <button
                        type="button"
                        className="device-table-pick"
                        disabled={busy}
                        onClick={(event) => { event.stopPropagation(); onPickTerminal(terminal); }}
                      >
                        {terminal.label}
                      </button>
                    ) : (
                      terminal.label
                    )}
                  </td>
                  <td className="device-table-fibers">
                    {terminal.fibers.length === 0 && (
                      <span className="device-table-free">{terminal.status === 'FREE' ? 'Libre' : 'En uso (sin hilo)'}</span>
                    )}
                    {terminal.fibers.length > 0 && (
                      <>
                      {terminal.fibers.map((fiber, index) => (
                        <Fragment key={fiber.fiberId}>
                        {index > 0 && <span className="device-table-join" aria-label="unido con">⟷</span>}
                        <span
                          className="device-table-chip"
                          style={{ backgroundColor: fiberColorHex(fiber.color), color: textOnColor(fiber.color) }}
                        >
                          {fiber.cableCode} · hilo {fiber.number}
                          {fiber.linkId && (
                            <button
                              type="button"
                              className="device-table-unlink"
                              disabled={busy}
                              aria-label={`Quitar hilo ${fiber.number} de ${terminal.label}`}
                              title="Quitar esta conexión"
                              onClick={(event) => {
                                event.stopPropagation();
                                onRemoveLink(fiber.linkId!, `el hilo ${fiber.number} de ${fiber.cableCode} de ${terminal.label}`);
                              }}
                            >
                              <X size={12} aria-hidden="true" />
                            </button>
                          )}
                        </span>
                        </Fragment>
                      ))}
                      {terminal.fibers.length < MAX_FIBERS_PER_PORT && <span className="device-table-free device-table-side-free">⟷ lado libre</span>}
                      </>
                    )}
                  </td>
                  {showPeers && (
                    <td className="device-table-peers">
                      <button
                        type="button"
                        className="device-table-connect"
                        disabled={busy}
                        title="Conectar este puerto con otro dispositivo"
                        onClick={(event) => { event.stopPropagation(); onOpenConnect(terminal); }}
                      >
                        {terminal.peers.map((peer) => <span key={peer}>{peer}</span>)}
                        {(terminal.remote ?? []).map((end) => (
                          <span key={`${end.deviceId}-${end.fiberNumber}`} className="device-table-remote">
                            → {KIND_LABEL[end.deviceType]} {end.deviceName}{end.portLabel ? ` · ${end.portLabel}` : ''}
                          </span>
                        ))}
                        {terminal.peers.length === 0 && (terminal.remote ?? []).length === 0 && <span className="device-table-connect-empty">+ Conectar</span>}
                      </button>
                    </td>
                  )}
                </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Hoja de conexiones de un ODF, una manga o una caja NAP, en dos partes como la hoja de empalme de
// Excel: a la izquierda cada fibra (hilo, buffer, servicio y en qué puerto entra) y a la derecha el
// dispositivo (sus puertos y qué hilo entra en cada uno). Clic en un hilo y luego en un puerto los conecta.
export default function ConnectionsTableModal({ elementKind, elementId, onClose }: ConnectionsTableModalProps) {
  const titleId = useId();
  const [table, setTable] = useState<ConnectionsTable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Hilo elegido (clic en la tabla de la fibra) esperando el clic en un puerto del dispositivo.
  const [picked, setPicked] = useState<{ fiberId: string; number: number; cableCode: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Puerto cuyo "Fusionado con" se abrió para conectarlo con otro dispositivo.
  const [connecting, setConnecting] = useState<DeviceTerminal | null>(null);

  const load = useCallback(async () => {
    try {
      setTable(await apiJson<ConnectionsTable>(`/${ENDPOINT_BY_KIND[elementKind]}/${elementId}/table`, {}, 'No se pudo cargar la tabla de conexiones'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la tabla de conexiones');
    }
  }, [elementKind, elementId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    // Escape primero suelta el hilo elegido; si no hay ninguno, cierra.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (picked) setPicked(null);
      else onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, picked]);

  const connect = async (terminal: DeviceTerminal) => {
    if (!picked) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/optical-connections/fiber-link', {
        method: 'POST',
        body: JSON.stringify({ deviceType: elementKind, deviceId: elementId, fiberId: picked.fiberId, terminalKey: terminal.key }),
      });
      await readJson(res, 'No se pudo conectar el hilo');
      setNotice(`Hilo ${picked.number} de ${picked.cableCode} conectado a ${terminal.label}.`);
      setPicked(null);
      await load();
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'No se pudo conectar el hilo');
    } finally {
      setBusy(false);
    }
  };

  const removeLink = async (linkId: string, text: string) => {
    if (!window.confirm(`¿Quitar ${text}?`)) return;
    setBusy(true);
    setError(null);
    try {
      await readJson(await apiFetch(`/optical-connections/${linkId}`, { method: 'DELETE' }), 'No se pudo quitar la conexión');
      setNotice(`Se quitó ${text}.`);
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'No se pudo quitar la conexión');
    } finally {
      setBusy(false);
    }
  };

  const title = TITLE_BY_KIND[elementKind];
  const capacityLabel = CAPACITY_LABEL_BY_KIND[elementKind];
  const emptyHint =
    elementKind === 'ODF'
      ? 'Este ODF todavía no tiene fibras conectadas. Traza una fibra que empiece en su centro y aquí aparecerán sus hilos, con buffer, servicio y puerto.'
      : elementKind === 'NAP'
        ? 'Esta caja NAP todavía no recibe ninguna fibra. Traza una fibra hasta el centro de esta caja y aquí aparecerán sus hilos.'
        : 'Esta manga todavía no tiene fibras conectadas. Traza una fibra que empiece o pase por su centro y aquí aparecerán sus hilos.';

  const cableHeading = (cable: ConnectionsTable['cables'][number], index: number) => {
    if (elementKind !== 'NAP') return `Salida ${index + 1} · ${cable.code}`;
    return cable.role === 'START' ? `Continúa hacia ${cable.code}` : `Llega desde ${cable.code}`;
  };

  const terminals = table?.terminals ?? [];

  return (
    <div className="odf-table-backdrop" onMouseDown={onClose}>
      <section className="odf-table-modal connections-sheet-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()}>
        <header className="odf-table-header">
          <div>
            <p>{title}</p>
            <h2 id={titleId}>{table?.device.name ?? 'Cargando...'}</h2>
            {table?.device.capacity != null && <span>{table.portsInUse} de {table.device.capacity} {capacityLabel} con hilo asignado</span>}
            {table && table.device.capacity == null && <span>{table.portsInUse} {capacityLabel} con hilo asignado</span>}
          </div>
          <button type="button" className="btn-icon icon-button" onClick={onClose} aria-label="Cerrar tabla de conexiones"><X size={19} /></button>
        </header>

        <div className="odf-table-body">
          {loading && <p className="muted">Cargando...</p>}
          {error && <DismissibleAlert className="cable-inspector-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}
          {table && terminals.length > 0 && table.cables.length > 0 && (
            <div className={`connections-sheet-bar${picked ? ' is-picking' : ''}`} role="status">
              {picked ? (
                <>
                  <span>Hilo <strong>{picked.number}</strong> de <strong>{picked.cableCode}</strong> elegido: haz clic en el puerto de la derecha (un puerto une hasta dos hilos).</span>
                  <button type="button" className="btn-secondary" onClick={() => setPicked(null)}>Cancelar</button>
                </>
              ) : (
                <span>{notice ?? 'Para conectar: haz clic en un hilo de la fibra y luego en un puerto del dispositivo.'}</span>
              )}
            </div>
          )}
          {table && (
            <div className="connections-sheet">
              <div className="connections-sheet-side">
                <h3 className="connections-sheet-title">Fibras</h3>
                {table.cables.length === 0 && <p className="odf-table-empty">{emptyHint}</p>}
                {table.cables.map((cable, index) => {
                  const buffers: FiberTableBuffer[] = cable.buffers.map((buffer) => ({
                    number: buffer.number,
                    color: buffer.color,
                    rows: buffer.fibers.map((fiber) => ({
                      id: fiber.id,
                      number: fiber.number,
                      color: fiber.color,
                      status: fiber.status,
                      service: fiber.service,
                      links: fiber.links ?? [],
                    })),
                  }));
                  return (
                    <article className="odf-table-cable" key={cable.cableId}>
                      <h3>
                        {cableHeading(cable, index)}
                        <small>{fiberCountLabel(cable.fiberCount)} · hilos {cable.fiberFrom} a {cable.fiberTo}{cable.name ? ` · ${cable.name}` : ''}</small>
                      </h3>
                      {buffers.length === 0 ? (
                        <p className="odf-table-empty">
                          {cable.hasInventory
                            ? 'Esta conexión no cubre ningún hilo. Ajusta su rango en el inspector de la fibra.'
                            : 'Esta fibra no tiene inventario de hilos. Ábrela en el mapa y genera sus hilos.'}
                        </p>
                      ) : (
                        <FiberTable
                          caption={`Hilos de la fibra ${cable.code} en ${table.device.name}`}
                          buffers={buffers}
                          showLinks
                          selectedId={picked?.fiberId ?? null}
                          onSelectRow={(row) => {
                            setNotice(null);
                            setPicked(picked?.fiberId === row.id ? null : { fiberId: row.id, number: row.number, cableCode: cable.code });
                          }}
                        />
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="connections-sheet-side connections-sheet-device">
                <h3 className="connections-sheet-title">{KIND_LABEL[elementKind]} {table.device.name}</h3>
                {terminals.length === 0 ? (
                  <p className="odf-table-empty">
                    {elementKind === 'ODF'
                      ? 'Este ODF no tiene puertos.'
                      : 'No tiene splitters ni puertos. Agrégalos en el Editor de Conexiones para poder conectar los hilos.'}
                  </p>
                ) : (
                  <DeviceTable
                    kind={elementKind}
                    name={table.device.name ?? ''}
                    terminals={terminals}
                    picking={picked !== null}
                    busy={busy}
                    onPickTerminal={connect}
                    onRemoveLink={removeLink}
                    onOpenConnect={(terminal) => { setPicked(null); setConnecting(terminal); }}
                  />
                )}
                {elementKind !== 'ODF' && (
                  <p className="connections-sheet-hint">También aparecen aquí las fusiones registradas con su hilo en el Editor de Conexiones.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      {connecting && table && (
        <ConnectDeviceModal
          deviceKind={elementKind}
          deviceId={elementId}
          deviceName={table.device.name ?? table.device.code}
          terminal={connecting}
          cables={table.cables.map((cable) => ({ ...cable, devices: cable.devices ?? [] }))}
          onClose={() => setConnecting(null)}
          onConnected={(message) => {
            setConnecting(null);
            setNotice(message);
            load();
          }}
        />
      )}
    </div>
  );
}
