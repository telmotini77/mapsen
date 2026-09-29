import { useEffect, useId, useState, type FormEvent } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiJson, apiList } from '../lib/api';
import EditEntityModal from './EditEntityModal';
import './ClientsPage.css';
import DismissibleAlert from './DismissibleAlert';

const CUSTOMER_STATUS_OPTIONS = [
  { value: 'PROSPECT', label: 'PROSPECT' },
  { value: 'VIABLE', label: 'VIABLE' },
  { value: 'NOT_VIABLE', label: 'NOT_VIABLE' },
  { value: 'CONNECTED', label: 'CONNECTED' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

interface ViabilityResult {
  viable: boolean;
  distanceMeters: number | null;
  maxDistanceMeters: number;
  portsAvailable: number | null;
  reason: string | null;
  nearestBox: { id: string; code: string; name: string | null } | null;
}

export default function ClientsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ViabilityResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const latId = useId();
  const lngId = useId();
  const nameId = useId();
  const addressId = useId();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      setCustomers(await apiList('/customers', 'No se pudieron cargar los clientes'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCheckViability = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setChecking(true);
    try {
      setResult(await apiJson(`/customers/viability?lat=${lat}&lng=${lng}`, {}, 'No se pudo verificar la viabilidad'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar viabilidad');
    } finally {
      setChecking(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!name.trim()) {
      setError('Ingresa un nombre para el cliente');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apiJson('/customers', {
        method: 'POST',
        body: JSON.stringify({ name, address, latitude: Number(lat), longitude: Number(lng) }),
      }, 'No se pudo guardar el cliente');
      setName('');
      setAddress('');
      setResult(null);
      fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCustomer = async (values: Record<string, any>) => {
    if (!editingCustomer) return;
    await apiJson(`/customers/${editingCustomer.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: values.name,
        address: values.address,
        phone: values.phone,
        email: values.email,
        status: values.status,
      }),
    }, 'No se pudo actualizar el cliente');
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await apiJson(`/customers/${id}`, { method: 'DELETE' }, 'No se pudo eliminar el cliente');
      fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el cliente');
    }
  };

  return (
    <div className="clients-page">
      <div className="clients-header">
        <div>
          <h2>Clientes y Viabilidad de Cobertura</h2>
          <p>Verifica si una dirección puede conectarse a la red FTTH existente antes de registrarla.</p>
        </div>
        <button className="btn-secondary" onClick={fetchCustomers} aria-label="Actualizar lista de clientes" title="Actualizar lista">
          <RefreshCw size={14} aria-hidden="true" /> Actualizar
        </button>
      </div>

      <div className="viability-panel">
        <form className="viability-form" onSubmit={handleCheckViability}>
          <div className="viability-field">
            <label htmlFor={latId}>Latitud</label>
            <input id={latId} value={lat} onChange={(e) => setLat(e.target.value)} placeholder="40.7128" required />
          </div>
          <div className="viability-field">
            <label htmlFor={lngId}>Longitud</label>
            <input id={lngId} value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-74.0060" required />
          </div>
          <button type="submit" className="btn-primary" disabled={checking}>
            {checking ? 'Verificando...' : 'Verificar viabilidad'}
          </button>
        </form>

        {error && <DismissibleAlert className="viability-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}

        {result && (
          <div className={`viability-result ${result.viable ? 'viable' : 'not-viable'}`} role="status">
            <div className="viability-badge">{result.viable ? 'VIABLE' : 'NO VIABLE'}</div>
            {result.nearestBox && (
              <p>
                Caja más cercana: <strong>{result.nearestBox.code}</strong> a{' '}
                <strong>{result.distanceMeters}m</strong> (rango máximo {result.maxDistanceMeters}m)
              </p>
            )}
            {result.reason && <p className="viability-reason">{result.reason}</p>}

            <div className="viability-save">
              <label className="visually-hidden" htmlFor={nameId}>Nombre del cliente</label>
              <input
                id={nameId}
                placeholder="Nombre del cliente"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label className="visually-hidden" htmlFor={addressId}>Dirección (opcional)</label>
              <input
                id={addressId}
                placeholder="Dirección (opcional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button className="btn-primary" onClick={handleSaveCustomer} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar como cliente'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="clients-table-container" aria-live="polite">
        {loading ? (
          <p>Cargando clientes...</p>
        ) : (
          <table className="clients-table">
            <caption className="visually-hidden">Lista de clientes registrados</caption>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th>Distancia a caja</th>
                <th>Lat / Lng</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    No hay clientes registrados
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.address || '-'}</td>
                    <td>
                      <span className={`badge status-${c.status.toLowerCase()}`}>{c.status}</span>
                    </td>
                    <td>{c.distanceToBoxMeters ? `${Number(c.distanceToBoxMeters).toFixed(1)}m` : '-'}</td>
                    <td>
                      {Number(c.latitude).toFixed(5)}, {Number(c.longitude).toFixed(5)}
                    </td>
                    <td>
                      <button className="btn-action view" onClick={() => setEditingCustomer(c)} aria-label={`Editar ${c.name}`}>Editar</button>
                      <button className="btn-action delete" onClick={() => handleDeleteCustomer(c.id)} aria-label={`Eliminar ${c.name}`}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {editingCustomer && (
        <EditEntityModal
          title={`Editar cliente: ${editingCustomer.name}`}
          initialValues={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={handleUpdateCustomer}
          fields={[
            { key: 'name', label: 'Nombre' },
            { key: 'address', label: 'Dirección' },
            { key: 'phone', label: 'Teléfono' },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Estado', type: 'select', options: CUSTOMER_STATUS_OPTIONS },
          ]}
        />
      )}
    </div>
  );
}
