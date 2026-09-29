import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiFetch, apiJson, apiList } from '../lib/api';
import EditEntityModal from './EditEntityModal';
import DismissibleAlert from './DismissibleAlert';
import {
  ELEMENT_HELP,
  FIBER_COUNTS,
  MANGA_TYPES,
  MANGA_TYPE_LABELS,
  NAP_SPLITTER_RATIOS,
  ODF_CAPACITIES,
  createElement,
  readJson,
} from '../lib/network';
import './RegistryPage.css';

const SPLITTER_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'FAULTY'].map((v) => ({ value: v, label: v }));

export default function RegistryPage() {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [odfCount, setOdfCount] = useState(0);
  const [splitters, setSplitters] = useState<any[]>([]);
  const [editingSplitter, setEditingSplitter] = useState<any | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // ODF
  const [odfName, setOdfName] = useState('');
  const [odfCapacity, setOdfCapacity] = useState(24);
  const [odfLat, setOdfLat] = useState('');
  const [odfLng, setOdfLng] = useState('');

  // Manga
  const [mangaName, setMangaName] = useState('');
  const [mangaType, setMangaType] = useState('DISTRIBUCION');
  const [mangaFibers, setMangaFibers] = useState(12);
  const [mangaLat, setMangaLat] = useState('');
  const [mangaLng, setMangaLng] = useState('');

  // Caja NAP
  const [napName, setNapName] = useState('');
  const [napRatio, setNapRatio] = useState('1:8');
  const [napLat, setNapLat] = useState('');
  const [napLng, setNapLng] = useState('');


  // Conexión
  const [connBoxId, setConnBoxId] = useState('');
  const [connBoxDetail, setConnBoxDetail] = useState<any | null>(null);
  const [connSource, setConnSource] = useState('');
  const [connTarget, setConnTarget] = useState('');
  const [connAssignments, setConnAssignments] = useState<any[]>([]);
  const [connSourceFiber, setConnSourceFiber] = useState('');
  const [connTargetFiber, setConnTargetFiber] = useState('');

  const notify = (type: 'ok' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fail = (err: unknown, fallback: string) => notify('error', err instanceof Error ? err.message : fallback);

  const loadAll = async () => {
    try {
      const [boxesData, odfs, splittersData] = await Promise.all([
        apiFetch('/boxes').then((r) => readJson(r, 'No se pudieron cargar las cajas')),
        apiFetch('/odfs').then((r) => readJson(r, 'No se pudieron cargar los ODF')),
        apiFetch('/splitters').then((r) => readJson(r, 'No se pudieron cargar los splitters')),
      ]);
      setBoxes(boxesData);
      setOdfCount(odfs.length);
      setSplitters(splittersData);
    } catch (err) {
      fail(err, 'No se pudo cargar el registro');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    setConnSourceFiber('');
    setConnTargetFiber('');
    if (!connBoxId) {
      setConnAssignments([]);
      return;
    }
    apiList(`/fibers/box/${connBoxId}/assignments`, 'No se pudieron cargar los hilos de la caja')
      .then(setConnAssignments)
      .catch((err) => {
        setConnAssignments([]);
        fail(err, 'No se pudieron cargar los hilos de la caja');
      });
  }, [connBoxId]);

  useEffect(() => {
    if (!connBoxId) {
      setConnBoxDetail(null);
      return;
    }
    apiJson(`/boxes/${connBoxId}`, {}, 'No se pudo cargar la caja seleccionada')
      .then(setConnBoxDetail)
      .catch((err) => {
        setConnBoxDetail(null);
        fail(err, 'No se pudo cargar la caja seleccionada');
      });
  }, [connBoxId]);

  const boxLabel = (b: any) => (b.type === 'MANGA' ? `${b.code} · Manga ${MANGA_TYPE_LABELS[b.mangaType]?.toLowerCase() ?? ''}` : `${b.code} · Caja NAP`);

  const connTerminals = useMemo(() => {
    if (!connBoxDetail) return [];
    const boxPorts = connBoxDetail.ports.map((p: any) => ({
      refType: 'BOX_PORT',
      refId: p.id,
      label: `Puerto #${p.number} (${p.type}) — ${p.status}`,
      portType: p.type,
    }));
    const splitterPorts = connBoxDetail.splitters.flatMap((s: any) =>
      s.ports.map((p: any) => ({
        refType: p.portType === 'INPUT' ? 'SPLITTER_INPUT' : 'SPLITTER_OUTPUT',
        refId: p.id,
        label: `${s.code} · ${p.portType === 'INPUT' ? 'Entrada' : 'Salida'} #${p.number} — ${p.status}`,
      })),
    );
    return [...boxPorts, ...splitterPorts];
  }, [connBoxDetail]);
  // En una caja NAP la fusión siempre va de una salida del splitter (origen) a un puerto DROP (destino).
  const connIsNap = connBoxDetail?.type === 'NAP';
  const connSourceOptions = connIsNap ? connTerminals.filter((t: any) => t.refType === 'SPLITTER_OUTPUT') : connTerminals;
  const connTargetOptions = connIsNap ? connTerminals.filter((t: any) => t.refType === 'BOX_PORT' && t.portType === 'DROP') : connTerminals;

  const needCoords = (name: string, lat: string, lng: string, what: string) => {
    if (!name.trim() || !lat || !lng) {
      notify('error', `Completa nombre, latitud y longitud de ${what}`);
      return false;
    }
    return true;
  };

  const handleCreateOdf = async (e: FormEvent) => {
    e.preventDefault();
    if (!needCoords(odfName, odfLat, odfLng, 'el ODF')) return;
    try {
      await createElement('ODF', { name: odfName, capacity: odfCapacity, latitude: Number(odfLat), longitude: Number(odfLng) });
      notify('ok', `ODF "${odfName}" creado con ${odfCapacity} puertos`);
      setOdfName(''); setOdfLat(''); setOdfLng('');
      loadAll();
    } catch (err) {
      fail(err, 'No se pudo crear el ODF');
    }
  };

  const handleCreateManga = async (e: FormEvent) => {
    e.preventDefault();
    if (!needCoords(mangaName, mangaLat, mangaLng, 'la manga')) return;
    try {
      await createElement('MANGA', { name: mangaName, mangaType, capacity: mangaFibers, latitude: Number(mangaLat), longitude: Number(mangaLng) });
      notify('ok', `Manga "${mangaName}" creada`);
      setMangaName(''); setMangaLat(''); setMangaLng('');
      loadAll();
    } catch (err) {
      fail(err, 'No se pudo crear la manga');
    }
  };

  const handleCreateNap = async (e: FormEvent) => {
    e.preventDefault();
    if (!needCoords(napName, napLat, napLng, 'la caja NAP')) return;
    try {
      await createElement('NAP', { name: napName, splitterRatio: napRatio, latitude: Number(napLat), longitude: Number(napLng) });
      notify('ok', `Caja NAP "${napName}" creada con splitter ${napRatio}`);
      setNapName(''); setNapLat(''); setNapLng('');
      loadAll();
    } catch (err) {
      fail(err, 'No se pudo crear la caja NAP');
    }
  };

  const handleUpdateSplitter = async (values: Record<string, any>) => {
    if (!editingSplitter) return;
    const res = await apiFetch(`/splitters/${editingSplitter.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ code: values.code, name: values.name, ratio: values.ratio, status: values.status }),
    });
    await readJson(res, 'No se pudo actualizar el splitter');
    setEditingSplitter(null);
    loadAll();
  };

  // Igual que en el Editor de Conexiones: si el splitter tiene conexiones, se avisa que sus fusiones
  // se eliminarán con él y solo entonces se borra (el backend lo exige con ?force=true).
  const handleDeleteSplitter = async (splitter: any) => {
    const usedCount = (splitter.ports ?? []).filter((p: any) => p.status !== 'FREE').length;
    const withConnectionsMessage = (detail: string) =>
      `El splitter ${splitter.code} (${splitter.ratio}) tiene conexiones: ${detail}

Si lo eliminas, también se eliminarán esas fusiones y sus puertos quedarán libres. ¿Eliminarlo de todas formas?`;
    const confirmed = usedCount > 0
      ? window.confirm(withConnectionsMessage(`${usedCount} puerto(s) en uso.`))
      : window.confirm(`¿Eliminar el splitter ${splitter.code} (${splitter.ratio})?`);
    if (!confirmed) return;
    try {
      const url = `/splitters/${splitter.id}`;
      let res = await apiFetch(usedCount > 0 ? `${url}?force=true` : url, { method: 'DELETE' });
      if (res.status === 409) {
        const body = await res.json().catch(() => ({}));
        if (!window.confirm(withConnectionsMessage(body.message ?? 'tiene fusiones activas.'))) return;
        res = await apiFetch(`${url}?force=true`, { method: 'DELETE' });
      }
      await readJson(res, 'No se pudo eliminar el splitter');
      notify('ok', `Splitter ${splitter.code} eliminado`);
      loadAll();
    } catch (err) {
      fail(err, 'No se pudo eliminar el splitter');
    }
  };

  const handleCreateConnection = async (e: FormEvent) => {
    e.preventDefault();
    if (!connBoxId || !connSource || !connTarget) {
      notify('error', 'Selecciona la caja o manga, el origen y el destino de la fusión');
      return;
    }
    const [sourceType, sourceId] = connSource.split('::');
    const [targetType, targetId] = connTarget.split('::');
    try {
      const res = await apiFetch('/optical-connections', {
        method: 'POST',
        body: JSON.stringify({ boxId: connBoxId, sourceType, sourceId, targetType, targetId, sourceFiberId: connSourceFiber || undefined, targetFiberId: connTargetFiber || undefined, connectionType: 'SPLICE' }),
      });
      await readJson(res, 'No se pudo crear la conexión');
      notify('ok', 'Conexión registrada correctamente');
      setConnSource('');
      setConnTarget('');
      setConnSourceFiber('');
      setConnTargetFiber('');
      apiJson(`/boxes/${connBoxId}`, {}, 'No se pudo recargar la caja').then(setConnBoxDetail).catch((err) => fail(err, 'No se pudo recargar la caja'));
    } catch (err) {
      fail(err, 'No se pudo crear la conexión');
    }
  };

  const terminalId = (value: string) => value.split('::')[1];
  const sourceFiberOptions = connAssignments.filter((a) => a.entityId === terminalId(connSource));
  const targetFiberOptions = connAssignments.filter((a) => a.entityId === terminalId(connTarget));

  const splitterRatioOptions = (s: any) =>
    (s.box?.type === 'MANGA' ? ['1:8'] : NAP_SPLITTER_RATIOS).map((v) => ({ value: v, label: v }));

  return (
    <div className="registry-page">
      <header className="panel-header">
        <h2>Registro de Red</h2>
        <p>Da de alta ODF, mangas, cajas NAP y splitters, y conéctalos entre sí. Las fibras se trazan desde el mapa.</p>
      </header>

      {message && (
        <DismissibleAlert
          className={`registry-toast ${message.type}`}
          role={message.type === 'error' ? 'alert' : 'status'}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </DismissibleAlert>
      )}

      <div className="registry-grid">
        <section className="registry-card">
          <div className="registry-card-header">
            <h3>Nuevo ODF</h3>
            <button type="button" className="btn-icon-refresh icon-button" onClick={loadAll} aria-label="Actualizar registro" title="Actualizar">
              <RefreshCw size={14} aria-hidden="true" />
            </button>
          </div>
          <p className="registry-help">{ELEMENT_HELP.ODF}</p>
          <form onSubmit={handleCreateOdf} className="registry-form">
            <label>
              Nombre / código
              <input value={odfName} onChange={(e) => setOdfName(e.target.value)} placeholder="ODF-001" />
            </label>
            <label>
              Puertos
              <select value={odfCapacity} onChange={(e) => setOdfCapacity(Number(e.target.value))}>
                {ODF_CAPACITIES.map((c) => (
                  <option key={c} value={c}>{c} puertos</option>
                ))}
              </select>
            </label>
            <div className="registry-form-row">
              <label>
                Latitud
                <input value={odfLat} onChange={(e) => setOdfLat(e.target.value)} placeholder="-2.90055" />
              </label>
              <label>
                Longitud
                <input value={odfLng} onChange={(e) => setOdfLng(e.target.value)} placeholder="-79.00453" />
              </label>
            </div>
            <button className="btn-primary" type="submit">+ Registrar ODF</button>
          </form>
          <p className="registry-count">{odfCount} ODF registrado(s)</p>
        </section>

        <section className="registry-card">
          <div className="registry-card-header">
            <h3>Nueva manga</h3>
          </div>
          <p className="registry-help">{ELEMENT_HELP.MANGA}</p>
          <form onSubmit={handleCreateManga} className="registry-form">
            <label>
              Nombre / código
              <input value={mangaName} onChange={(e) => setMangaName(e.target.value)} placeholder="MANGA-001" />
            </label>
            <label>
              Tipo de manga
              <select value={mangaType} onChange={(e) => setMangaType(e.target.value)}>
                {MANGA_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <span className="muted">{MANGA_TYPES.find((t) => t.value === mangaType)?.help}</span>
            </label>
            <label>
              Hilos de la fibra
              <select value={mangaFibers} onChange={(e) => setMangaFibers(Number(e.target.value))}>
                {FIBER_COUNTS.map((c) => (
                  <option key={c} value={c}>{c} hilos</option>
                ))}
              </select>
            </label>
            <div className="registry-form-row">
              <label>
                Latitud
                <input value={mangaLat} onChange={(e) => setMangaLat(e.target.value)} placeholder="-2.90055" />
              </label>
              <label>
                Longitud
                <input value={mangaLng} onChange={(e) => setMangaLng(e.target.value)} placeholder="-79.00453" />
              </label>
            </div>
            <button className="btn-primary" type="submit">+ Registrar manga</button>
          </form>
          <p className="registry-count">{boxes.filter((b) => b.type === 'MANGA').length} manga(s) registrada(s)</p>
        </section>

        <section className="registry-card">
          <div className="registry-card-header">
            <h3>Nueva caja NAP</h3>
          </div>
          <p className="registry-help">{ELEMENT_HELP.NAP}</p>
          <form onSubmit={handleCreateNap} className="registry-form">
            <label>
              Nombre / código
              <input value={napName} onChange={(e) => setNapName(e.target.value)} placeholder="NAP-001" />
            </label>
            <label>
              Splitter interno
              <select value={napRatio} onChange={(e) => setNapRatio(e.target.value)}>
                {NAP_SPLITTER_RATIOS.map((r) => (
                  <option key={r} value={r}>{r} ({r.split(':')[1]} salidas hacia ONU)</option>
                ))}
              </select>
            </label>
            <div className="registry-form-row">
              <label>
                Latitud
                <input value={napLat} onChange={(e) => setNapLat(e.target.value)} placeholder="-2.90055" />
              </label>
              <label>
                Longitud
                <input value={napLng} onChange={(e) => setNapLng(e.target.value)} placeholder="-79.00453" />
              </label>
            </div>
            <button className="btn-primary" type="submit">+ Registrar caja NAP</button>
          </form>
          <p className="registry-count">{boxes.filter((b) => b.type === 'NAP').length} caja(s) NAP registrada(s)</p>
        </section>

        <section className="registry-card registry-card-wide">
          <div className="registry-card-header">
            <h3>Splitters</h3>
          </div>
          <p className="registry-help">
            Cada caja NAP nace con su splitter (1:8 o 1:16) y cada manga de distribución con uno primario 1:8. Una caja
            NAP puede tener un splitter 1:16, o uno o dos 1:8 (máximo 16 salidas); una manga de distribución, uno solo
            1:8. Para agregar un splitter usa el Editor de Conexiones.
          </p>
          {splitters.length > 0 && (
            <div className="registry-mini-table-wrapper">
            <table className="registry-mini-table">
              <caption className="visually-hidden">Lista de splitters registrados</caption>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Ubicación</th>
                  <th>Relación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {splitters.map((s) => (
                  <tr key={s.id}>
                    <td>{s.code}</td>
                    <td>{s.box ? boxLabel(s.box) : '-'}</td>
                    <td>{s.ratio}</td>
                    <td>{s.status}</td>
                    <td>
                      <button className="btn-action edit" onClick={() => setEditingSplitter(s)} aria-label={`Editar splitter ${s.code}`}>Editar</button>
                      <button className="btn-action delete" onClick={() => handleDeleteSplitter(s)} aria-label={`Eliminar splitter ${s.code}`}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </section>

        <section className="registry-card">
          <h3>Nueva conexión (fusión)</h3>
          <form onSubmit={handleCreateConnection} className="registry-form">
            <label>
              Manga o caja NAP
              <select value={connBoxId} onChange={(e) => { setConnBoxId(e.target.value); setConnSource(''); setConnTarget(''); }}>
                <option value="">Selecciona una manga o caja NAP...</option>
                {boxes.map((b) => (
                  <option key={b.id} value={b.id}>{boxLabel(b)}</option>
                ))}
              </select>
            </label>
            <label>
              Origen
              <select value={connSource} onChange={(e) => { setConnSource(e.target.value); setConnSourceFiber(''); }} disabled={!connBoxDetail}>
                <option value="">{connIsNap ? 'Salida de splitter...' : 'Selecciona origen...'}</option>
                {connSourceOptions.map((t) => (
                  <option key={`src-${t.refType}-${t.refId}`} value={`${t.refType}::${t.refId}`}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Destino
              <select value={connTarget} onChange={(e) => { setConnTarget(e.target.value); setConnTargetFiber(''); }} disabled={!connBoxDetail}>
                <option value="">{connIsNap ? 'Puerto DROP...' : 'Selecciona destino...'}</option>
                {connTargetOptions.map((t) => (
                  <option key={`dst-${t.refType}-${t.refId}`} value={`${t.refType}::${t.refId}`}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Hilo de origen
              <select value={connSourceFiber} onChange={(e) => setConnSourceFiber(e.target.value)} disabled={!connSource || sourceFiberOptions.length === 0}>
                <option value="">{connSource ? (sourceFiberOptions.length ? 'Hilo de origen (opcional)...' : 'Sin hilo asignado a este puerto') : 'Selecciona primero el origen'}</option>
                {sourceFiberOptions.map((f: any) => <option key={f.fiberId} value={f.fiberId}>Hilo {f.fiberNumber} · {f.label || f.cableCode}</option>)}
              </select>
            </label>
            <label>
              Hilo de destino
              <select value={connTargetFiber} onChange={(e) => setConnTargetFiber(e.target.value)} disabled={!connTarget || targetFiberOptions.length === 0}>
                <option value="">{connTarget ? (targetFiberOptions.length ? 'Hilo de destino (opcional)...' : 'Sin hilo asignado a este puerto') : 'Selecciona primero el destino'}</option>
                {targetFiberOptions.map((f: any) => <option key={f.fiberId} value={f.fiberId}>Hilo {f.fiberNumber} · {f.label || f.cableCode}</option>)}
              </select>
            </label>
            <button className="btn-primary" type="submit">+ Registrar conexión</button>
          </form>
          {connBoxId && connTerminals.length === 0 && (
            <p className="muted">Esta caja aún no tiene puertos ni splitters. Genera puertos desde el Editor de Conexiones.</p>
          )}
        </section>
      </div>

      {editingSplitter && (
        <EditEntityModal
          title={`Editar splitter: ${editingSplitter.code}`}
          initialValues={editingSplitter}
          onClose={() => setEditingSplitter(null)}
          onSave={handleUpdateSplitter}
          fields={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'ratio', label: 'Relación', type: 'select', options: splitterRatioOptions(editingSplitter) },
            { key: 'status', label: 'Estado', type: 'select', options: SPLITTER_STATUS_OPTIONS },
          ]}
        />
      )}
    </div>
  );
}
