import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import DismissibleAlert from './DismissibleAlert';

export type FiberForConfiguration = {
  id: string;
  number: number;
  label?: string | null;
  status: string;
  attenuationDbPerKm?: string | number | null;
  description?: string | null;
  connections: Array<{ from: { id: string }; to: { id: string } }>;
};

type TerminalOption = {
  type: string;
  entityId: string;
  boxId: string;
  portIdentifier: string;
  label: string;
  status: string;
  terminationId: string | null;
};

interface FiberConfigurationPanelProps {
  cableId: string;
  fiber: FiberForConfiguration;
  onClose: () => void;
  onSaved: () => void;
}

export default function FiberConfigurationPanel({ cableId, fiber, onClose, onSaved }: FiberConfigurationPanelProps) {
  const [sourceOptions, setSourceOptions] = useState<TerminalOption[]>([]);
  const [targetOptions, setTargetOptions] = useState<TerminalOption[]>([]);
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [label, setLabel] = useState(fiber.label ?? '');
  const [status, setStatus] = useState(fiber.status);
  const [attenuation, setAttenuation] = useState(fiber.attenuationDbPerKm?.toString() ?? '');
  const [description, setDescription] = useState(fiber.description ?? '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`/fibers/cable/${cableId}/assignment-options`);
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message ?? 'No se pudieron cargar los terminales del cable.');
        const source = body.source ?? [];
        const target = body.target ?? [];
        setSourceOptions(source);
        setTargetOptions(target);
        const current = fiber.connections[0];
        setSourceId(source.find((option: TerminalOption) => option.terminationId === current?.from.id)?.entityId ?? '');
        setTargetId(target.find((option: TerminalOption) => option.terminationId === current?.to.id)?.entityId ?? '');
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los terminales.');
      } finally { setLoading(false); }
    };
    loadOptions();
  }, [cableId, fiber.id]);

  const save = async () => {
    setSaving(true); setError(null);
    try {
      const response = await apiFetch(`/fibers/${fiber.id}/configuration`, {
        method: 'PATCH',
        body: JSON.stringify({
          label: label.trim() || undefined,
          status,
          attenuationDbPerKm: attenuation === '' ? undefined : Number(attenuation),
          description: description.trim() || undefined,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? 'No se pudo guardar la configuración.');

      if (sourceId || targetId) {
        if (!sourceId || !targetId) throw new Error('Selecciona tanto el terminal de salida como el de llegada.');
        const source = sourceOptions.find((option) => option.entityId === sourceId);
        const target = targetOptions.find((option) => option.entityId === targetId);
        if (!source || !target) throw new Error('Los terminales seleccionados ya no están disponibles.');
        const assignment = await apiFetch(`/fibers/${fiber.id}/terminations`, {
          method: 'PUT', body: JSON.stringify({ source, target }),
        });
        const assignmentBody = await assignment.json().catch(() => ({}));
        if (!assignment.ok) throw new Error(assignmentBody.message ?? 'No se pudo asignar el hilo a los terminales.');
      }
      onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el hilo.');
    } finally { setSaving(false); }
  };

  return <section className="fiber-configuration-panel" aria-label={`Configurar hilo ${fiber.number}`}>
    <header><div><strong>Configuración del hilo {String(fiber.number).padStart(2, '0')}</strong><span>Identidad, estado y terminales físicos</span></div><button type="button" className="btn-icon icon-button" onClick={onClose} aria-label="Cerrar configuración"><X size={16} /></button></header>
    {loading ? <p className="muted">Cargando terminales disponibles...</p> : <>
      <div className="fiber-config-fields">
        <label>Servicio<input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Ej. TO OLT ESTADIO" /></label>
        <label>Estado<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="FREE">Libre</option><option value="USED">En uso</option><option value="RESERVED">Reservado</option><option value="DAMAGED">Dañado</option><option value="DISCONNECTED">Desconectado</option><option value="TEST">Prueba</option></select></label>
        <label>Atenuación (dB/km)<input type="number" min="0" step="0.001" value={attenuation} onChange={(event) => setAttenuation(event.target.value)} placeholder="0.350" /></label>
        <label className="fiber-config-wide">Notas<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} placeholder="Uso, cliente, medición u observaciones..." /></label>
      </div>
      <div className="fiber-assignment">
        <strong>Asignación en intercepciones</strong>
        <p>Selecciona el puerto por el que sale y el puerto al que llega este hilo. Puede ser un puerto NAP, manga o splitter.</p>
        <div className="fiber-config-fields">
          <label>Salida / origen<select value={sourceId} onChange={(event) => setSourceId(event.target.value)} disabled={sourceOptions.length === 0}><option value="">{sourceOptions.length ? 'Seleccionar terminal...' : 'Este cable no tiene el inicio registrado en un ODF, manga o caja NAP'}</option>{sourceOptions.map((option) => <option key={option.entityId} value={option.entityId}>{option.label} — {option.status}</option>)}</select></label>
          <label>Llegada / destino<select value={targetId} onChange={(event) => setTargetId(event.target.value)} disabled={targetOptions.length === 0}><option value="">{targetOptions.length ? 'Seleccionar terminal...' : 'Este cable no tiene el final registrado en un ODF, manga o caja NAP'}</option>{targetOptions.map((option) => <option key={option.entityId} value={option.entityId}>{option.label} — {option.status}</option>)}</select></label>
        </div>
      </div>
      {error && <DismissibleAlert className="cable-inspector-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}
      <div className="fiber-config-actions"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button type="button" className="btn-primary" onClick={save} disabled={saving}><Save size={15} /> {saving ? 'Guardando...' : 'Guardar hilo'}</button></div>
    </>}
  </section>;
}
