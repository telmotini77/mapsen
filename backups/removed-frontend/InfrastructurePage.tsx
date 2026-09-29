import { useEffect, useState, type FormEvent } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import './InfrastructurePage.css';

type Equipment = Record<string, any>;

const number = (value: string, fallback?: number) => value === '' ? fallback : Number(value);

export default function InfrastructurePage() {
  const [pops, setPops] = useState<Equipment[]>([]);
  const [racks, setRacks] = useState<Equipment[]>([]);
  const [olts, setOlts] = useState<Equipment[]>([]);
  const [dios, setDios] = useState<Equipment[]>([]);
  const [switches, setSwitches] = useState<Equipment[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [popForm, setPopForm] = useState({ name: '', latitude: '', longitude: '' });
  const [rackForm, setRackForm] = useState({ name: '', popId: '', rackUnits: '42' });
  const [oltForm, setOltForm] = useState({ name: '', popId: '', rackId: '', latitude: '', longitude: '' });
  const [dioForm, setDioForm] = useState({ name: '', popId: '', rackId: '', capacity: '24' });
  const [switchForm, setSwitchForm] = useState({ name: '', popId: '', rackId: '', portCount: '24' });

  const refresh = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(['pops', 'racks', 'olts', 'dios', 'switches'].map((resource) => apiFetch(`/${resource}`)));
      const [popData, rackData, oltData, dioData, switchData] = await Promise.all(responses.map((response) => response.json()));
      setPops(popData); setRacks(rackData); setOlts(oltData); setDios(dioData); setSwitches(switchData);
    } catch {
      setMessage('No se pudo cargar el inventario de red.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const create = async (resource: string, body: Record<string, unknown>, done: () => void) => {
    setMessage(null);
    try {
      const response = await apiFetch(`/${resource}`, { method: 'POST', body: JSON.stringify(body) });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message ?? `No se pudo crear ${resource}`);
      }
      done();
      setMessage(`${resource.slice(0, -1).toUpperCase()} registrado correctamente.`);
      refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el elemento.');
    }
  };

  const remove = async (resource: string, id: string, label: string) => {
    if (!window.confirm(`¿Eliminar ${label}?`)) return;
    const response = await apiFetch(`/${resource}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setMessage(`No se pudo eliminar ${label}.`);
      return;
    }
    refresh();
  };

  const submit = (event: FormEvent, action: () => void) => { event.preventDefault(); action(); };

  return (
    <div className="infrastructure-page">
      <header className="panel-header infrastructure-header">
        <div>
          <h2>Infraestructura activa</h2>
          <p>Documenta la cadena POP → rack → OLT/DIO/switch con capacidad y ubicación.</p>
        </div>
        <button className="btn-secondary" onClick={refresh} disabled={loading}><RefreshCw size={14} /> Actualizar</button>
      </header>
      {message && <p className="infrastructure-message" role="status">{message}</p>}

      <div className="infrastructure-grid">
        <section className="infrastructure-card">
          <h3>POP ({pops.length})</h3>
          <form onSubmit={(e) => submit(e, () => create('pops', { name: popForm.name, latitude: number(popForm.latitude), longitude: number(popForm.longitude) }, () => setPopForm({ name: '', latitude: '', longitude: '' })))}>
            <input required placeholder="Nombre del POP" value={popForm.name} onChange={(e) => setPopForm({ ...popForm, name: e.target.value })} />
            <div className="infrastructure-row"><input required type="number" step="any" placeholder="Latitud" value={popForm.latitude} onChange={(e) => setPopForm({ ...popForm, latitude: e.target.value })} /><input required type="number" step="any" placeholder="Longitud" value={popForm.longitude} onChange={(e) => setPopForm({ ...popForm, longitude: e.target.value })} /></div>
            <button className="btn-primary">Registrar POP</button>
          </form>
          <EquipmentList items={pops} label={(item) => `${item.code} · ${item.name}`} onRemove={(item) => remove('pops', item.id, item.code)} />
        </section>

        <section className="infrastructure-card">
          <h3>Racks ({racks.length})</h3>
          <form onSubmit={(e) => submit(e, () => create('racks', { name: rackForm.name, popId: rackForm.popId, rackUnits: number(rackForm.rackUnits, 42) }, () => setRackForm({ name: '', popId: '', rackUnits: '42' })))}>
            <select required value={rackForm.popId} onChange={(e) => setRackForm({ ...rackForm, popId: e.target.value })}><option value="">POP...</option>{pops.map((pop) => <option key={pop.id} value={pop.id}>{pop.code} · {pop.name}</option>)}</select>
            <div className="infrastructure-row"><input required placeholder="Nombre del rack" value={rackForm.name} onChange={(e) => setRackForm({ ...rackForm, name: e.target.value })} /><input type="number" min="1" placeholder="Unidades" value={rackForm.rackUnits} onChange={(e) => setRackForm({ ...rackForm, rackUnits: e.target.value })} /></div>
            <button className="btn-primary" disabled={!pops.length}>Registrar rack</button>
          </form>
          <EquipmentList items={racks} label={(item) => `${item.code} · ${item.name} (${item.usedUnits}/${item.rackUnits}U)`} onRemove={(item) => remove('racks', item.id, item.code)} />
        </section>

        <section className="infrastructure-card">
          <h3>OLT ({olts.length})</h3>
          <form onSubmit={(e) => submit(e, () => create('olts', { ...oltForm, latitude: number(oltForm.latitude), longitude: number(oltForm.longitude), popId: oltForm.popId || undefined, rackId: oltForm.rackId || undefined }, () => setOltForm({ name: '', popId: '', rackId: '', latitude: '', longitude: '' })))}>
            <PlacementSelect pops={pops} racks={racks} value={oltForm} onChange={setOltForm} />
            <div className="infrastructure-row"><input required placeholder="Nombre OLT" value={oltForm.name} onChange={(e) => setOltForm({ ...oltForm, name: e.target.value })} /><input required type="number" step="any" placeholder="Latitud" value={oltForm.latitude} onChange={(e) => setOltForm({ ...oltForm, latitude: e.target.value })} /></div>
            <input required type="number" step="any" placeholder="Longitud" value={oltForm.longitude} onChange={(e) => setOltForm({ ...oltForm, longitude: e.target.value })} />
            <button className="btn-primary" disabled={!pops.length}>Registrar OLT</button>
          </form>
          <EquipmentList items={olts} label={(item) => `${item.code} · ${item.name}`} onRemove={(item) => remove('olts', item.id, item.code)} />
        </section>

        <section className="infrastructure-card">
          <h3>DIO ({dios.length})</h3>
          <form onSubmit={(e) => submit(e, () => create('dios', { ...dioForm, capacity: number(dioForm.capacity, 24), popId: dioForm.popId || undefined, rackId: dioForm.rackId || undefined }, () => setDioForm({ name: '', popId: '', rackId: '', capacity: '24' })))}>
            <PlacementSelect pops={pops} racks={racks} value={dioForm} onChange={setDioForm} />
            <div className="infrastructure-row"><input required placeholder="Nombre DIO" value={dioForm.name} onChange={(e) => setDioForm({ ...dioForm, name: e.target.value })} /><input type="number" min="0" placeholder="Puertos" value={dioForm.capacity} onChange={(e) => setDioForm({ ...dioForm, capacity: e.target.value })} /></div>
            <button className="btn-primary" disabled={!pops.length}>Registrar DIO</button>
          </form>
          <EquipmentList items={dios} label={(item) => `${item.code} · ${item.name} (${item.usedPorts}/${item.capacity})`} onRemove={(item) => remove('dios', item.id, item.code)} />
        </section>

        <section className="infrastructure-card infrastructure-card-wide">
          <h3>Switches ({switches.length})</h3>
          <form onSubmit={(e) => submit(e, () => create('switches', { ...switchForm, portCount: number(switchForm.portCount, 24), popId: switchForm.popId || undefined, rackId: switchForm.rackId || undefined }, () => setSwitchForm({ name: '', popId: '', rackId: '', portCount: '24' })))}>
            <PlacementSelect pops={pops} racks={racks} value={switchForm} onChange={setSwitchForm} />
            <div className="infrastructure-row"><input required placeholder="Nombre del switch" value={switchForm.name} onChange={(e) => setSwitchForm({ ...switchForm, name: e.target.value })} /><input type="number" min="1" placeholder="Puertos" value={switchForm.portCount} onChange={(e) => setSwitchForm({ ...switchForm, portCount: e.target.value })} /></div>
            <button className="btn-primary" disabled={!pops.length}>Registrar switch</button>
          </form>
          <EquipmentList items={switches} label={(item) => `${item.code} · ${item.name} (${item.portCount} puertos)`} onRemove={(item) => remove('switches', item.id, item.code)} />
        </section>
      </div>
    </div>
  );
}

function PlacementSelect({ pops, racks, value, onChange }: { pops: Equipment[]; racks: Equipment[]; value: any; onChange: (value: any) => void }) {
  return <div className="infrastructure-row"><select required value={value.popId} onChange={(e) => onChange({ ...value, popId: e.target.value, rackId: '' })}><option value="">POP...</option>{pops.map((pop) => <option key={pop.id} value={pop.id}>{pop.code}</option>)}</select><select value={value.rackId} onChange={(e) => onChange({ ...value, rackId: e.target.value })}><option value="">Sin rack</option>{racks.filter((rack) => rack.popId === value.popId).map((rack) => <option key={rack.id} value={rack.id}>{rack.code}</option>)}</select></div>;
}

function EquipmentList({ items, label, onRemove }: { items: Equipment[]; label: (item: Equipment) => string; onRemove: (item: Equipment) => void }) {
  return <ul className="equipment-list">{items.map((item) => <li key={item.id}><span>{label(item)}</span><button className="btn-icon icon-button" onClick={() => onRemove(item)} aria-label={`Eliminar ${item.code}`}><Trash2 size={14} /></button></li>)}</ul>;
}
