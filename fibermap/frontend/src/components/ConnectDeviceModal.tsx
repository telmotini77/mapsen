import { useEffect, useId, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { apiFetch, apiJson } from '../lib/api';
import { readJson } from '../lib/network';
import DismissibleAlert from './DismissibleAlert';

export type DeviceKind = 'ODF' | 'MANGA' | 'NAP';

export interface SheetTerminal {
  key: string;
  label: string;
  fibers: Array<{ fiberId: string; cableId: string; cableCode: string; number: number; color: string; linkId?: string }>;
}

export interface SheetCable {
  cableId: string;
  code: string;
  devices: Array<{ type: DeviceKind; id: string; name: string; fiberFrom: number; fiberTo: number }>;
  buffers: Array<{ fibers: Array<{ id: string; number: number; status: string; service: string | null; links?: string[] }> }>;
}

interface ConnectDeviceModalProps {
  deviceKind: DeviceKind;
  deviceId: string;
  deviceName: string;
  terminal: SheetTerminal;
  cables: SheetCable[];
  onClose: () => void;
  onConnected: (message: string) => void;
}

const KIND_LABEL: Record<DeviceKind, string> = { ODF: 'ODF', MANGA: 'Manga', NAP: 'Caja NAP' };
const ENDPOINT_BY_KIND: Record<DeviceKind, string> = { ODF: 'odfs', MANGA: 'boxes', NAP: 'boxes' };

interface RemoteTerminal {
  key: string;
  label: string;
  group: string;
  fibers: Array<{ fiberId: string; cableCode: string; number: number; linkId?: string }>;
}

// Todo puerto es de entrada y salida: une hasta dos hilos, uno por cada lado.
const MAX_FIBERS_PER_PORT = 2;

// Conecta un puerto de este dispositivo con un dispositivo vecino (NAP, manga u ODF) al que llega una
// de sus fibras: se elige el dispositivo, el hilo que lleva la señal y, si se quiere, el puerto donde
// llega allá. Si el puerto ya tiene un hilo que va hacia ese dispositivo se usa ese; si no, se ocupa
// el lado libre del puerto con un hilo nuevo. Se guarda como enlaces hilo → puerto (aquí y allá).
export default function ConnectDeviceModal({ deviceKind, deviceId, deviceName, terminal, cables, onClose, onConnected }: ConnectDeviceModalProps) {
  const titleId = useId();
  const portFull = terminal.fibers.length >= MAX_FIBERS_PER_PORT;
  const [targetId, setTargetId] = useState('');
  const [fiberId, setFiberId] = useState('');
  const [targetPort, setTargetPort] = useState('');
  const [remoteTerminals, setRemoteTerminals] = useState<RemoteTerminal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Un hilo que ya está en este puerto y que por su fibra llega a ese dispositivo.
  const portFiberTo = (deviceIdToReach: string) =>
    terminal.fibers.find((fiber) => {
      const reach = cables.find((cable) => cable.cableId === fiber.cableId)?.devices.find((d) => d.id === deviceIdToReach);
      return reach && fiber.number >= reach.fiberFrom && fiber.number <= reach.fiberTo;
    }) ?? null;

  // Dispositivos vecinos: los que toca alguna fibra de esta hoja. Con el puerto lleno (dos hilos),
  // solo los que alcanzan esos mismos hilos.
  const targets = useMemo(() => {
    const byId = new Map<string, { type: DeviceKind; id: string; name: string; via: string[] }>();
    for (const cable of cables) {
      for (const device of cable.devices) {
        if (portFull && !portFiberTo(device.id)) continue;
        const entry = byId.get(device.id) ?? { type: device.type, id: device.id, name: device.name, via: [] };
        if (!entry.via.includes(cable.code)) entry.via.push(cable.code);
        byId.set(device.id, entry);
      }
    }
    return [...byId.values()].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cables, terminal, portFull]);
  const target = targets.find((t) => t.id === targetId) ?? null;
  // Si el puerto ya tiene un hilo que va hacia el destino, la señal sigue por ese mismo hilo.
  const fixedFiber = target ? portFiberTo(target.id) : null;

  // Hilos que pueden llevar la señal hasta el dispositivo elegido y que aún no entran a otro puerto aquí.
  const fiberOptions = useMemo(() => {
    if (!target || fixedFiber) return [];
    return cables.flatMap((cable) => {
      const reach = cable.devices.find((d) => d.id === target.id);
      if (!reach) return [];
      return cable.buffers.flatMap((buffer) =>
        buffer.fibers
          .filter((fiber) => fiber.number >= reach.fiberFrom && fiber.number <= reach.fiberTo && !(fiber.links?.length))
          .map((fiber) => ({ id: fiber.id, label: `${cable.code} · hilo ${fiber.number}${fiber.service ? ` (${fiber.service})` : ''}` })),
      );
    });
  }, [cables, target, fixedFiber]);

  useEffect(() => {
    setTargetPort('');
    setRemoteTerminals(null);
    setFiberId(fixedFiber?.fiberId ?? '');
    if (!target) return;
    let cancelled = false;
    apiJson<{ terminals?: RemoteTerminal[] }>(`/${ENDPOINT_BY_KIND[target.type]}/${target.id}/table`, {}, 'No se pudieron cargar los puertos del dispositivo')
      .then((result) => { if (!cancelled) setRemoteTerminals(result.terminals ?? []); })
      .catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los puertos'); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  // Un puerto de allá está lleno si ya une dos hilos distintos del elegido.
  const othersOn = (port: RemoteTerminal) => port.fibers.filter((f) => f.fiberId !== fiberId);
  const portTaken = (port: RemoteTerminal) => othersOn(port).length >= MAX_FIBERS_PER_PORT;
  const portText = (port: RemoteTerminal) => {
    if (port.fibers.some((f) => f.fiberId === fiberId)) return `${port.label} (ya tiene este hilo)`;
    const others = othersOn(port);
    if (others.length === 0) return `${port.label} — libre`;
    const list = others.map((f) => `${f.cableCode} hilo ${f.number}`).join(' y ');
    return portTaken(port) ? `${port.label} — lleno: ${list}` : `${port.label} — un lado libre (tiene ${list})`;
  };

  const canSave = Boolean(target && fiberId && (!fixedFiber || targetPort)) && !saving;

  const save = async () => {
    if (!target || !fiberId) return;
    setSaving(true);
    setError(null);
    const link = (body: Record<string, string>) =>
      apiFetch('/optical-connections/fiber-link', { method: 'POST', body: JSON.stringify(body) }).then((res) => readJson(res, 'No se pudo conectar'));
    try {
      if (!fixedFiber) {
        await link({ deviceType: deviceKind, deviceId, fiberId, terminalKey: terminal.key });
      }
      const port = remoteTerminals?.find((t) => t.key === targetPort);
      if (port && !port.fibers.some((f) => f.fiberId === fiberId)) {
        try {
          await link({ deviceType: target.type, deviceId: target.id, fiberId, terminalKey: port.key });
        } catch (remoteError) {
          const reason = remoteError instanceof Error ? remoteError.message : 'error desconocido';
          onConnected(`${terminal.label} quedó conectado al hilo, pero no se pudo registrar el puerto en ${target.name}: ${reason}`);
          return;
        }
      }
      onConnected(`${terminal.label} conectado con ${KIND_LABEL[target.type]} ${target.name}${port ? ` · ${port.label}` : ''}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo conectar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="odf-table-backdrop connect-device-backdrop" onMouseDown={onClose}>
      <section className="odf-table-modal connect-device-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()}>
        <header className="odf-table-header">
          <div>
            <p>Conectar con otro dispositivo</p>
            <h2 id={titleId}>{terminal.label}</h2>
            <span>
              {KIND_LABEL[deviceKind]} {deviceName}
              {terminal.fibers.length > 0 ? ` · une ${terminal.fibers.map((f) => `${f.cableCode} hilo ${f.number}`).join(' y ')}` : ' · puerto libre'}
            </span>
          </div>
          <button type="button" className="btn-icon icon-button" onClick={onClose} aria-label="Cerrar"><X size={19} /></button>
        </header>

        <div className="odf-table-body connect-device-body">
          {error && <DismissibleAlert className="cable-inspector-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}
          {targets.length === 0 ? (
            <p className="odf-table-empty">
              {portFull
                ? 'Este puerto ya une dos hilos y ninguno llega a un dispositivo vecino. Quita uno para usar ese lado.'
                : 'Ninguna fibra de este dispositivo llega a otro dispositivo. Traza una fibra en el mapa que pase por los dos.'}
            </p>
          ) : (
            <>
              <label>
                Dispositivo destino
                <select value={targetId} onChange={(event) => setTargetId(event.target.value)}>
                  <option value="">Elige NAP, manga u ODF...</option>
                  {targets.map((t) => (
                    <option key={t.id} value={t.id}>{KIND_LABEL[t.type]} {t.name} (por {t.via.join(', ')})</option>
                  ))}
                </select>
              </label>

              {target && fixedFiber && (
                <p className="connect-device-note">La señal sigue por <strong>{fixedFiber.cableCode} hilo {fixedFiber.number}</strong>, que ya está en este puerto y llega a {target.name}.</p>
              )}

              {target && !fixedFiber && (
                <label>
                  Hilo que lleva la señal (lado libre del puerto)
                  <select value={fiberId} onChange={(event) => setFiberId(event.target.value)}>
                    <option value="">{fiberOptions.length ? 'Elige el hilo...' : 'No quedan hilos libres hacia ese dispositivo'}</option>
                    {fiberOptions.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </label>
              )}

              {target && (
                <label>
                  Puerto donde llega en {target.name}{fixedFiber ? '' : ' (opcional)'}
                  <select value={targetPort} onChange={(event) => setTargetPort(event.target.value)} disabled={!remoteTerminals}>
                    <option value="">{remoteTerminals ? (fixedFiber ? 'Elige el puerto...' : 'Sin indicar puerto') : 'Cargando puertos...'}</option>
                    {(remoteTerminals ?? []).map((port) => (
                      <option key={port.key} value={port.key} disabled={portTaken(port)}>{port.group} · {portText(port)}</option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}
        </div>

        <footer className="connect-device-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={save} disabled={!canSave}>{saving ? 'Conectando...' : 'Conectar'}</button>
        </footer>
      </section>
    </div>
  );
}
