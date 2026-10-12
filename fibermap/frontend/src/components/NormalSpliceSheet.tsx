import { useId, useState } from 'react';
import { apiJson } from '../lib/api';
import { fiberColorHex, serviceText, textOnColor } from '../lib/fiberColors';
import DismissibleAlert from './DismissibleAlert';

interface Fiber { id: string; number: number; color: string; status?: string; service?: string | null }
interface Cable { cableId: string; code: string; name?: string | null; role: string; buffers: Array<{ number: number; color: string; fibers: Fiber[] }>; devices?: Array<{ name: string }> }
export interface SpliceSheetData {
  cables: Cable[];
  terminals?: Array<{ key: string; fibers: Array<{ fiberId: string; linkId?: string }> }>;
}
interface Props { data: SpliceSheetData; deviceId: string; deviceName: string; onRefresh: () => Promise<void> | void }

export default function NormalSpliceSheet({ data, deviceId, deviceName, onRefresh }: Props) {
  const formId = useId();
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fibers = data.cables.flatMap((cable) => cable.buffers.flatMap((buffer) => buffer.fibers.map((fiber) => ({ ...fiber, cable, buffer }))));
  const byId = new Map(fibers.map((fiber) => [fiber.id, fiber]));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const mappings = new Map<string, { target: string; linkId: string }>();
  const outputUsed = new Set<string>();
  for (const terminal of data.terminals ?? []) {
    if (!terminal.key.startsWith('SPLICE:') && !terminal.key.startsWith('MAPPING:')) continue;
    const a = terminal.fibers[0]?.fiberId;
    const b = terminal.fibers[1]?.fiberId;
    if (!a || !b) continue;
    mappings.set(a, { target: b, linkId: terminal.key.slice(terminal.key.indexOf(':') + 1) });
    outputUsed.add(b);
  }
  // Keep both inventories complete and ordered independently of the splice mapping.
  const ordered = [...fibers].sort((a, b) => data.cables.indexOf(a.cable) - data.cables.indexOf(b.cable) || a.number - b.number);
  const inputs = ordered.filter((fiber) => fiber.cable.role !== 'START');
  const outputs = ordered.filter((fiber) => fiber.cable.role !== 'END');
  const rows = Array.from({ length: Math.max(inputs.length, outputs.length) }, (_, index) => {
    const a = inputs[index];
    const mapping = a ? mappings.get(a.id) : undefined;
    const continuous = !!a && !mapping && a.cable.role === 'PASS' && !outputUsed.has(a.id);
    return { a, b: outputs[index], targetId: mapping?.target ?? (continuous ? a.id : ''), linkId: mapping?.linkId, continuous };
  });
  const saveMapping = async (sourceId: string, targetId: string) => {
    if (!targetId) return;
    setBusy(true); setError(null);
    try {
      await apiJson('/optical-connections/normal-mapping', { method: 'POST', body: JSON.stringify({ boxId: deviceId, sourceFiberId: sourceId, targetFiberId: targetId }) }, 'No se pudo modificar la salida');
      setDrafts({});
      await onRefresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo modificar la salida'); }
    finally { setBusy(false); }
  };
  const action = async (linkId?: string) => {
    if (!linkId && (!source || !target)) return;
    setBusy(true); setError(null);
    try {
      if (linkId) await apiJson(`/optical-connections/${linkId}`, { method: 'DELETE' }, 'No se pudo quitar el empalme');
      else {
        await apiJson('/optical-connections/normal-mapping', { method: 'POST', body: JSON.stringify({ boxId: deviceId, sourceFiberId: source, targetFiberId: target }) }, 'No se pudo registrar el empalme');
        setSource(''); setTarget('');
      }
      await onRefresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar el empalme'); }
    finally { setBusy(false); }
  };
  const side = (fiber?: typeof fibers[number]) => fiber ? <>
    <td className="splice-cable">{fiber.cable.code}<small>{fiber.cable.name ?? ''}</small></td>
    <td style={{ backgroundColor: fiberColorHex(fiber.buffer.color), color: textOnColor(fiber.buffer.color) }}>Buffer {fiber.buffer.number}</td>
    <td style={{ backgroundColor: fiberColorHex(fiber.color), color: textOnColor(fiber.color) }}>Hilo {fiber.number}</td>
    <td style={{ backgroundColor: fiberColorHex(fiber.color), color: textOnColor(fiber.color) }}>{serviceText(fiber.service, fiber.status ?? 'FREE')}</td>
  </> : <td colSpan={4} className="device-table-free">Sin hilo en este lado</td>;
  return <div className="normal-splice-sheet">
    {error && <DismissibleAlert onClose={() => setError(null)}>{error}</DismissibleAlert>}
    <p className="connections-sheet-hint">Entrada â†’ empalme en {deviceName} â†’ salida. Ambas columnas muestran todos los hilos en orden. Elige la conexión final de cada entrada y guarda el cambio. Si estÃ¡ ocupada, se intercambian las dos salidas.</p>
    <div className="normal-splice-form">
      <div className="normal-splice-field"><label htmlFor={`${formId}-source`}>Hilo de entrada</label><select id={`${formId}-source`} value={source} disabled={busy} onChange={(e) => { setSource(e.target.value); setTarget(''); }}><option value="">Seleccionar hilo</option>{fibers.filter((f) => !mappings.has(f.id) && f.cable.role !== 'START').map((f) => <option key={f.id} value={f.id}>{f.cable.code} Â· hilo {f.number}</option>)}</select></div>
      <div className="normal-splice-field"><label htmlFor={`${formId}-target`}>Hilo de salida</label><select id={`${formId}-target`} value={target} disabled={busy} onChange={(e) => setTarget(e.target.value)}><option value="">Seleccionar hilo</option>{fibers.filter((f) => f.cable.role !== 'END').map((f) => <option key={f.id} value={f.id}>{f.cable.code} Â· hilo {f.number}</option>)}</select></div>
      <button type="button" className="btn-primary" disabled={busy || !source || !target} onClick={() => void action()}>Unir hilos</button>
    </div>
    <div className="fiber-table-wrap"><table className="fiber-table normal-splice-table">
      <caption className="visually-hidden">Empalmes de entrada y salida en {deviceName}</caption>
      <thead><tr><th colSpan={4}>Fibra de entrada</th><th>Manga</th><th colSpan={4}>Fibra de salida</th><th>ConexiÃ³n</th></tr><tr><th>Fibra</th><th>Buffer</th><th>Hilo</th><th>Servicio</th><th>Empalme</th><th>Fibra</th><th>Buffer</th><th>Hilo</th><th>Servicio</th><th>Conexión final</th></tr></thead>
      <tbody>{rows.map((row, index) => {
        const selected = row.a ? drafts[row.a.id] ?? row.targetId : '';
        const destination = row.b;
        const connected = byId.get(selected);
        const changed = !!row.a && Object.hasOwn(drafts, row.a.id) && selected !== row.targetId;
        return <tr key={row.a?.id ?? `out-${row.b?.id}-${index}`}>
          {side(row.a)}<td className="splice-center">{deviceName}<small>â†’</small></td>{side(destination)}
          <td className="normal-mapping-cell">{row.a ? <>
            <label className="visually-hidden" htmlFor={`${formId}-${row.a.id}`}>Salida para {row.a.cable.code}, hilo {row.a.number}</label>
            <select id={`${formId}-${row.a.id}`} aria-label={`Salida para ${row.a.cable.code}, hilo ${row.a.number}`} value={selected} disabled={busy} onChange={(e) => setDrafts({ ...drafts, [row.a!.id]: e.target.value })}>
              <option value="">Sin salida</option>
              {fibers.filter((f) => f.cable.role !== 'END').map((f) => <option key={f.id} value={f.id}>{f.cable.code} Â· hilo {f.number}</option>)}
            </select>
            <button type="button" className="btn-primary" disabled={busy || !selected || !changed} onClick={() => void saveMapping(row.a!.id, selected)}>Guardar salida</button>
            {row.linkId && <button type="button" className="btn-secondary" disabled={busy} onClick={() => void action(row.linkId)}>Quitar empalme</button>}
            <small>{changed ? 'Cambio sin guardar' : row.continuous ? 'ContinÃºa por la misma fibra' : row.linkId ? `Entrada ${row.a.number} â†’ ${connected?.cable.code}, hilo ${connected?.number}` : 'Pendiente'}</small>
          </> : 'Salida disponible'}</td>
        </tr>;
      })}</tbody>
    </table></div>
    {rows.length === 0 && <p className="odf-table-empty">Traza una fibra hasta esta manga para ver sus hilos de entrada y salida.</p>}
  </div>;
}
