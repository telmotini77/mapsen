import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, Boxes, Cable, CheckCircle2, Download, Network, RefreshCw, Users } from 'lucide-react';
import { apiList } from '../lib/api';
import { fiberCountLabel } from '../lib/network';
import './OperationsPage.css';
import DismissibleAlert from './DismissibleAlert';

type Resource = Record<string, any>;

interface OperationsPageProps {
  onNavigate: (section: string) => void;
}

const resourceRequests = [
  ['boxes', '/boxes'],
  ['odfs', '/odfs'],
  ['customers', '/customers'],
  ['splitters', '/splitters'],
  ['connections', '/optical-connections'],
  ['cables', '/cables'],
  ['poles', '/poles'],
] as const;

const asNumber = (value: unknown) => Number(value ?? 0) || 0;

function csvValue(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

export default function OperationsPage({ onNavigate }: OperationsPageProps) {
  const [data, setData] = useState<Record<string, Resource[]>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payloads = await Promise.all(
        resourceRequests.map(([, path]) => apiList<Resource>(path, 'No se pudo cargar uno de los indicadores operativos.')),
      );
      setData(Object.fromEntries(resourceRequests.map(([key], index) => [key, payloads[index]])));
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el resumen operativo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const summary = useMemo(() => {
    const boxes = data.boxes ?? [];
    const naps = boxes.filter((box) => box.type === 'NAP');
    const mangas = boxes.filter((box) => box.type === 'MANGA');
    const odfs = data.odfs ?? [];
    const customers = data.customers ?? [];
    const cables = data.cables ?? [];
    const poles = data.poles ?? [];
    const capacity = naps.reduce((total, box) => total + asNumber(box.capacity ?? box.portCapacity), 0);
    const usedPorts = naps.reduce((total, box) => total + asNumber(box.usedPorts), 0);
    const connectedCustomers = customers.filter((customer) => customer.status === 'CONNECTED').length;
    const fiberMeters = cables.reduce((total, cable) => total + asNumber(cable.calculatedLengthMeters), 0);
    return { boxes, naps, mangas, odfs, customers, cables, poles, capacity, usedPorts, connectedCustomers, fiberMeters };
  }, [data]);

  const alerts = useMemo(() => {
    const capacityAlerts = summary.naps
      .map((box) => {
        const capacity = asNumber(box.capacity ?? box.portCapacity);
        const used = asNumber(box.usedPorts);
        return { box, capacity, used, rate: capacity ? Math.round((used / capacity) * 100) : 0 };
      })
      .filter((item) => item.capacity > 0 && item.rate >= 80)
      .sort((a, b) => b.rate - a.rate);
    const inactive = [...summary.boxes, ...summary.odfs].filter((item) => item.status === 'INACTIVE');
    const prospects = summary.customers.filter((customer) => customer.status === 'PROSPECT' || customer.status === 'NOT_VIABLE');
    return { capacityAlerts, inactive, prospects };
  }, [summary]);

  const exportInventory = () => {
    const location = (item: Resource) => `${item.latitude ?? ''}, ${item.longitude ?? ''}`;
    const rows = [
      ['Tipo', 'Código', 'Nombre', 'Estado', 'Capacidad', 'Usado', 'Ubicación'],
      ...summary.odfs.map((item) => ['ODF', item.code, item.name, item.status, item.capacity, item.usedPorts, location(item)]),
      ...summary.mangas.map((item) => [`Manga ${String(item.mangaType ?? '').toLowerCase()}`, item.code, item.name, item.status, `${item.capacity ?? ''} hilos`, '', location(item)]),
      ...summary.naps.map((item) => ['Caja NAP', item.code, item.name, item.status, item.capacity, item.usedPorts, location(item)]),
      ...summary.poles.map((item) => ['Poste', item.code, item.name, item.status, '', '', location(item)]),
      ...summary.cables.map((item) => ['Fibra', item.code, item.name, item.status, fiberCountLabel(item.fiberCount), '', `${Math.round(asNumber(item.calculatedLengthMeters))} m`]),
    ];
    const blob = new Blob([rows.map((row) => row.map(csvValue).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fibermap-inventario-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const portRate = summary.capacity ? Math.round((summary.usedPorts / summary.capacity) * 100) : 0;

  return (
    <section className="operations-page" aria-labelledby="operations-title">
      <header className="operations-header">
        <div>
          <p className="operations-eyebrow">Control diario de la red</p>
          <h2 id="operations-title">Centro de Operaciones</h2>
          <p>Consulta la salud de la red, identifica capacidad próxima a agotarse y accede al módulo que requiere atención.</p>
        </div>
        <div className="operations-header-actions">
          <button type="button" className="btn-secondary" onClick={exportInventory} disabled={loading}>
            <Download size={15} aria-hidden="true" /> Exportar inventario
          </button>
          <button type="button" className="btn-primary" onClick={refresh} disabled={loading}>
            <RefreshCw size={15} aria-hidden="true" className={loading ? 'operations-spin' : ''} /> {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </header>

      {error && <DismissibleAlert className="operations-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}
      {lastUpdated && <p className="operations-updated" aria-live="polite">Actualizado: {lastUpdated.toLocaleTimeString()}</p>}

      <div className="operations-metrics" aria-label="Indicadores principales">
        <Metric icon={<Network />} label="Elementos de red" value={summary.boxes.length + summary.odfs.length + summary.poles.length} detail={`${summary.odfs.length} ODF, ${summary.mangas.length} mangas, ${summary.naps.length} cajas y ${summary.poles.length} postes`} tone="blue" />
        <Metric icon={<Users />} label="Clientes conectados" value={summary.connectedCustomers} detail={`${summary.customers.length} clientes registrados`} tone="green" />
        <Metric icon={<Boxes />} label="Ocupación de cajas NAP" value={`${summary.usedPorts}/${summary.capacity}`} detail={summary.capacity ? `${portRate}% de las salidas hacia ONU` : 'Sin capacidad registrada'} tone={portRate >= 80 ? 'amber' : 'violet'} />
        <Metric icon={<Cable />} label="Fibra tendida" value={`${(summary.fiberMeters / 1000).toFixed(2)} km`} detail={`${summary.cables.length} tramo(s) de fibra`} tone="cyan" />
      </div>

      <div className="operations-grid">
        <section className="operations-card operations-alerts">
          <div className="operations-card-title"><AlertTriangle size={18} aria-hidden="true" /><h3>Acciones recomendadas</h3></div>
          {alerts.capacityAlerts.length === 0 && alerts.inactive.length === 0 && alerts.prospects.length === 0 ? (
            <p className="operations-empty"><CheckCircle2 size={18} aria-hidden="true" /> Sin alertas operativas. La información registrada no presenta riesgos inmediatos.</p>
          ) : (
            <ul className="operations-alert-list">
              {alerts.capacityAlerts.slice(0, 4).map(({ box, rate, used, capacity }) => <li key={`capacity-${box.id}`}><strong>{box.code}</strong><span>Capacidad alta: {used}/{capacity} puertos ({rate}%).</span><button type="button" onClick={() => onNavigate('box-editor')}>Gestionar conexiones</button></li>)}
              {alerts.inactive.slice(0, 3).map((item) => <li key={`inactive-${item.id}`}><strong>{item.code}</strong><span>Elemento {'inactivo'}; revisa su estado y trazabilidad.</span><button type="button" onClick={() => onNavigate('nodes')}>Revisar elemento</button></li>)}
              {alerts.prospects.slice(0, 3).map((item) => <li key={`customer-${item.id}`}><strong>{item.name}</strong><span>Cliente pendiente de evaluación o sin viabilidad.</span><button type="button" onClick={() => onNavigate('clients')}>Ver clientes</button></li>)}
            </ul>
          )}
        </section>

        <section className="operations-card">
          <div className="operations-card-title"><Network size={18} aria-hidden="true" /><h3>Guía de operación</h3></div>
          <ol className="operations-guide">
            <li><span>1</span><div><strong>Registrar</strong><p>Ubica ODF, mangas y cajas NAP en el mapa; splitters y fusiones van en el Editor de Conexiones.</p><button type="button" onClick={() => onNavigate('box-editor')}>Abrir Editor de Conexiones</button></div></li>
            <li><span>2</span><div><strong>Planificar en mapa</strong><p>Importa postes KMZ, ubica elementos y traza las fibras entre ellos.</p><button type="button" onClick={() => onNavigate('pole-import')}>Importar postes</button></div></li>
            <li><span>3</span><div><strong>Verificar servicio</strong><p>Evalúa cobertura y documenta clientes.</p><button type="button" onClick={() => onNavigate('clients')}>Evaluar clientes</button></div></li>
            <li><span>4</span><div><strong>Auditar continuidad</strong><p>Sigue puertos, splitters y enlaces ópticos desde el ODF hasta la ONU.</p><button type="button" onClick={() => onNavigate('trace')}>Abrir trazabilidad</button></div></li>
          </ol>
        </section>

        <section className="operations-card operations-inventory">
          <div className="operations-card-title"><Boxes size={18} aria-hidden="true" /><h3>Inventario físico</h3></div>
          <dl>
            <div><dt>ODF</dt><dd>{summary.odfs.length}</dd></div>
            <div><dt>Mangas</dt><dd>{summary.mangas.length}</dd></div>
            <div><dt>Cajas NAP</dt><dd>{summary.naps.length}</dd></div>
            <div><dt>Splitters</dt><dd>{data.splitters?.length ?? 0}</dd></div>
            <div><dt>Fibras</dt><dd>{summary.cables.length}</dd></div>
            <div><dt>Postes</dt><dd>{summary.poles.length}</dd></div>
          </dl>
          <button type="button" className="operations-link" onClick={() => onNavigate('pole-import')}>Importar postes KMZ →</button>
        </section>
      </div>
    </section>
  );
}

function Metric({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string | number; detail: string; tone: string }) {
  return <article className={`operations-metric ${tone}`}><span className="operations-metric-icon">{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>;
}
