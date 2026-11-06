import { useEffect, useRef, useState } from 'react';
import { Infinity as InfinityIcon, X } from 'lucide-react';
import { apiJson } from '../lib/api';
import type { NetworkElement } from '../lib/network';
import './BoxSlackModal.css';

export interface BoxSlack { id: string; boxId: string; cableId: string; cableCode: string; meters: number }
interface SlackData { reservations: BoxSlack[]; cables: { id: string; code: string }[] }

export default function BoxSlackModal({ box, canManage, onClose, onChanged }: { box: NetworkElement; canManage: boolean; onClose: () => void; onChanged: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const alive = useRef(true);
  const [data, setData] = useState<SlackData>({ reservations: [], cables: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshRequired, setRefreshRequired] = useState(false);
  const [error, setError] = useState('');
  const [cableId, setCableId] = useState('');
  const [meters, setMeters] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const base = `/boxes/${box.id}/slacks`;
  const validMeters = meters.trim() !== '' && Number.isFinite(Number(meters)) && Number(meters) > 0;

  useEffect(() => {
    alive.current = true;
    const controller = new AbortController();
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    apiJson<SlackData>(base, { signal: controller.signal }).then(next => {
      if (!controller.signal.aborted) { setData(next); setCableId(next.cables[0]?.id ?? ''); }
    }).catch(reason => { if (!controller.signal.aborted) setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { alive.current = false; controller.abort(); previous?.focus(); };
  }, [base]);

  async function refreshAfterSave() {
    setLoading(true); setError('');
    try {
      const next = await apiJson<SlackData>(base);
      if (alive.current) { setData(next); setCableId(next.cables[0]?.id ?? ''); setRefreshRequired(false); }
    } catch {
      if (alive.current) setError('El cambio se guardó, pero no se pudo actualizar la lista. Actualiza las reservas antes de continuar.');
    } finally { if (alive.current) setLoading(false); }
  }

  async function mutate(method: string, id?: string) {
    setSaving(true); setError('');
    try {
      await apiJson(`${base}${id ? `/${id}` : ''}`, { method, ...(method === 'DELETE' ? {} : { body: JSON.stringify({ meters: Number(meters), ...(method === 'POST' ? { cableId } : {}) }) }) });
    } catch (reason) {
      if (alive.current) { setError(reason instanceof Error ? reason.message : 'No se pudo guardar la reserva'); setSaving(false); }
      return;
    }
    if (alive.current) { setEditing(null); setMeters(''); setRefreshRequired(true); }
    onChanged();
    await refreshAfterSave();
    if (alive.current) setSaving(false);
  }
  return <dialog ref={dialog} className="box-slack-modal" aria-labelledby="box-slack-title" aria-modal="true"
    onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget && !saving) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
    <header><h2 id="box-slack-title"><InfinityIcon size={22} aria-hidden="true" /> Reservas de cable · {box.code}</h2><button type="button" autoFocus aria-label="Cerrar reservas de cable" disabled={saving} onClick={onClose}><X size={20} /></button></header>
    <p>Metros de cable enrollado físicamente en esta {box.kind === 'NAP' ? 'caja NAP' : 'manga'}.</p>
    {loading ? <p role="status">Cargando reservas…</p> : refreshRequired ? <button type="button" onClick={() => void refreshAfterSave()}>Actualizar reservas</button> : <>
      <p className="slack-total">Total: <strong>{data.reservations.reduce((total, record) => total + record.meters, 0).toLocaleString('es')} m</strong></p>
      {!data.reservations.length ? <p>No hay reservas de cable registradas.</p> : <ul className="slack-records">{data.reservations.map(record => <li key={record.id}><span><strong>{record.cableCode}</strong> · {record.meters.toLocaleString('es')} m</span>{canManage && <span className="slack-actions"><button disabled={saving} onClick={() => { setEditing(record.id); setCableId(record.cableId); setMeters(String(record.meters)); }}>Editar</button><button disabled={saving} onClick={() => mutate('DELETE', record.id)}>Eliminar</button></span>}</li>)}</ul>}
      {canManage && (data.cables.length ? <form onSubmit={event => { event.preventDefault(); if (validMeters && cableId && !saving) void mutate(editing ? 'PATCH' : 'POST', editing ?? undefined); }}>
        <h3>{editing ? 'Editar reserva' : 'Agregar reserva'}</h3>
        <label>Cable<select value={cableId} disabled={saving || !!editing} onChange={event => setCableId(event.target.value)}>{data.cables.map(cable => <option key={cable.id} value={cable.id}>{cable.code}</option>)}</select></label>
        <label>Metros<input type="number" min="0" step="any" required value={meters} disabled={saving} onChange={event => setMeters(event.target.value)} /></label>
        <div className="slack-actions"><button type="submit" disabled={!validMeters || !cableId || saving}>{saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar reserva'}</button>{editing && <button type="button" disabled={saving} onClick={() => { setEditing(null); setMeters(''); }}>Cancelar edición</button>}</div>
      </form> : <p>Conecta un cable a esta caja antes de agregar una reserva.</p>)}
    </>}
    {error && <p role="alert" className="slack-error">{error}</p>}
  </dialog>;
}
