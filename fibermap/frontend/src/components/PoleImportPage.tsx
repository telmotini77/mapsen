import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CheckCircle2, FileArchive, MapPin, Upload, X } from 'lucide-react';
import { apiJson, apiList } from '../lib/api';
import { ImportCancelled, parseKmz, type KmzProgress, type ParsedPole } from '../lib/kmz';
import './PoleImportPage.css';
import DismissibleAlert from './DismissibleAlert';

interface PoleImportPageProps {
  onImportCompleted: () => void;
  onOpenMap: () => void;
}

interface Bounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

type AreaMode = 'near' | 'all';

// El backend admite hasta 5000 por petición; lotes más chicos dan progreso más fluido.
const BATCH_SIZE = 2000;
const MARGIN_OPTIONS_KM = [0.5, 1, 2, 5, 10];
const CONFIRM_ABOVE = 50_000;

const mb = (bytes: number) => `${Math.round(bytes / 1_000_000).toLocaleString()} MB`;

// Rectángulo que abarca todos los elementos y fibras de la red, ampliado un margen en km.
function expandedBounds(points: { lat: number; lng: number }[], marginKm: number): Bounds | null {
  if (points.length === 0) return null;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const south = Math.min(...lats);
  const north = Math.max(...lats);
  const west = Math.min(...lngs);
  const east = Math.max(...lngs);
  const dLat = marginKm / 111;
  const dLng = marginKm / (111 * Math.max(Math.cos((((south + north) / 2) * Math.PI) / 180), 0.2));
  return { south: south - dLat, north: north + dLat, west: west - dLng, east: east + dLng };
}

export default function PoleImportPage({ onImportCompleted, onOpenMap }: PoleImportPageProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cancelImportRef = useRef(false);
  const [fileName, setFileName] = useState('');
  const [allPoles, setAllPoles] = useState<ParsedPole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [readProgress, setReadProgress] = useState<KmzProgress | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [networkPoints, setNetworkPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [areaMode, setAreaMode] = useState<AreaMode>('near');
  const [marginKm, setMarginKm] = useState(1);

  // Ubicación de la red actual (ODF, mangas, cajas NAP y fibras) para ofrecer "solo cerca de mi red".
  useEffect(() => {
    Promise.all([apiList('/odfs'), apiList('/boxes'), apiList('/cables')])
      .then(([odfs, boxes, cables]) => {
        const points: { lat: number; lng: number }[] = [];
        [...odfs, ...boxes].forEach((item) => points.push({ lat: Number(item.latitude), lng: Number(item.longitude) }));
        cables.forEach((cable) => (cable.path ?? []).forEach((p: { lat: number; lng: number }) => points.push({ lat: p.lat, lng: p.lng })));
        setNetworkPoints(points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)));
      })
      .catch(() => setNetworkPoints([]));
  }, []);

  const hasNetwork = networkPoints.length > 0;
  const effectiveMode: AreaMode = hasNetwork ? areaMode : 'all';

  const bounds = useMemo(() => (effectiveMode === 'near' ? expandedBounds(networkPoints, marginKm) : null), [effectiveMode, networkPoints, marginKm]);
  const selected = useMemo(
    () => (bounds ? allPoles.filter((p) => p.latitude >= bounds.south && p.latitude <= bounds.north && p.longitude >= bounds.west && p.longitude <= bounds.east) : allPoles),
    [allPoles, bounds],
  );

  const reset = () => {
    abortRef.current?.abort();
    setFileName(''); setAllPoles([]); setError(null); setStatus(null); setReadProgress(null); setImportProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = async (file?: File) => {
    reset();
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.kmz')) {
      setError('Selecciona un archivo con extensión .kmz.');
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setParsing(true);
    try {
      const { poles, ignored } = await parseKmz(file, { signal: controller.signal, onProgress: setReadProgress });
      setFileName(file.name);
      setAllPoles(poles);
      setStatus(`${poles.length.toLocaleString()} poste(s) leídos${ignored ? ` (${ignored.toLocaleString()} elementos que no son puntos se ignoraron)` : ''}. Elige qué zona importar.`);
    } catch (parseError) {
      if (!(parseError instanceof ImportCancelled)) {
        setError(parseError instanceof Error ? parseError.message : 'No se pudo leer el KMZ.');
      }
    } finally {
      setParsing(false);
      setReadProgress(null);
      abortRef.current = null;
    }
  };

  const importPoles = async () => {
    if (!selected.length) return;
    if (selected.length > CONFIRM_ABOVE && !window.confirm(`Vas a importar ${selected.length.toLocaleString()} postes. Puede tardar varios minutos. ¿Continuar?`)) return;
    setImporting(true); setError(null); setStatus(null);
    cancelImportRef.current = false;
    let imported = 0;
    let skipped = 0;
    let done = 0;
    setImportProgress({ done: 0, total: selected.length });
    try {
      for (let start = 0; start < selected.length; start += BATCH_SIZE) {
        if (cancelImportRef.current) break;
        const batch = selected.slice(start, start + BATCH_SIZE);
        const body = await apiJson('/poles/import', { method: 'POST', body: JSON.stringify({ poles: batch }) }, 'No se pudieron importar los postes.');
        imported += body.imported ?? 0;
        skipped += body.skipped ?? 0;
        done += batch.length;
        setImportProgress({ done, total: selected.length });
      }
      const cancelled = cancelImportRef.current;
      setStatus(
        `${cancelled ? 'Importación detenida: ' : ''}${imported.toLocaleString()} poste(s) importado(s) desde ${fileName}` +
          `${skipped ? `; ${skipped.toLocaleString()} ya existían y se omitieron` : ''}.`,
      );
    } catch (importError) {
      // Lo ya importado queda guardado; al reintentar, los postes existentes se omiten solos.
      const partial = imported ? ` Se alcanzaron a importar ${imported.toLocaleString()}; puedes reintentar y los ya cargados se omiten.` : '';
      setError(`${importError instanceof Error ? importError.message : 'No se pudieron importar los postes.'}${partial}`);
    } finally {
      setImporting(false);
      setImportProgress(null);
      if (imported > 0) onImportCompleted();
    }
  };

  const busy = parsing || importing;
  const readPercent = readProgress && readProgress.totalBytes > 0 ? Math.min(100, Math.round((readProgress.processedBytes / readProgress.totalBytes) * 100)) : null;
  const importPercent = importProgress ? Math.round((importProgress.done / importProgress.total) * 100) : null;

  return (
    <section className="pole-import-page" aria-labelledby="pole-import-title">
      <header className="pole-import-header">
        <div><p>Datos geográficos</p><h2 id="pole-import-title">Importar postes desde KMZ</h2><span>Lee los puntos KML del archivo (incluso de cientos de MB) y los muestra como puntos negros en el mapa cuando te acercas lo suficiente (verás el nivel de zoom en la esquina inferior derecha).</span></div>
        <button type="button" className="btn-secondary pole-map-button" onClick={onOpenMap}><MapPin size={15} /> Ver mapa</button>
      </header>

      <div className="pole-import-grid">
        <section className="pole-upload-card">
          <FileArchive size={30} aria-hidden="true" />
          <h3>Archivo de postes</h3>
          <p>Selecciona un archivo <strong>.kmz</strong> que tenga puntos KML (<code>Placemark / Point</code>). Las líneas y polígonos se ignoran.</p>
          <label htmlFor={inputId} className="pole-file-button"><Upload size={16} /> {parsing ? 'Leyendo KMZ...' : 'Seleccionar archivo KMZ'}</label>
          <input ref={inputRef} id={inputId} type="file" accept=".kmz,application/vnd.google-earth.kmz" onChange={(event) => handleFile(event.target.files?.[0])} disabled={busy} />
          <p className="pole-import-note">Los archivos grandes se leen por partes. Puedes importar solo los postes cercanos a tu red. Los postes que ya existen (mismas coordenadas) se omiten, así que puedes repetir la carga sin duplicar.</p>
        </section>

        <section className="pole-preview-card" aria-live="polite">
          <div className="pole-preview-heading"><div><h3>Vista previa</h3><p>{fileName || 'Aún no se ha seleccionado un archivo.'}</p></div>{(allPoles.length > 0 || parsing) && !importing && <button type="button" className="pole-clear-button" onClick={reset}><X size={15} /> {parsing ? 'Cancelar lectura' : 'Limpiar'}</button>}</div>
          {error && <DismissibleAlert className="pole-import-error" onClose={() => setError(null)}>{error}</DismissibleAlert>}
          {status && <DismissibleAlert className="pole-import-status" role="status" onClose={() => setStatus(null)}><CheckCircle2 size={16} /> {status}</DismissibleAlert>}

          {parsing && readProgress && (
            <div className="pole-progress" role="status">
              <progress value={readPercent ?? undefined} max={100} aria-label="Progreso de lectura del archivo" />
              <span>Leyendo… {readPercent !== null ? `${readPercent}% · ` : ''}{mb(readProgress.processedBytes)}{readProgress.totalBytes ? ` de ${mb(readProgress.totalBytes)}` : ''} · {readProgress.poles.toLocaleString()} postes</span>
            </div>
          )}

          {allPoles.length > 0 && (
            <>
              <fieldset className="pole-area" disabled={importing}>
                <legend>Zona a importar</legend>
                <label className={!hasNetwork ? 'disabled' : ''}>
                  <input type="radio" name="pole-area" checked={effectiveMode === 'near'} disabled={!hasNetwork} onChange={() => setAreaMode('near')} />
                  <span>Solo cerca de mi red <small>{hasNetwork ? 'ODF, mangas, cajas NAP y fibras registradas' : 'Aún no tienes elementos en la red'}</small></span>
                </label>
                {effectiveMode === 'near' && (
                  <label className="pole-area-margin">
                    Margen alrededor de la red
                    <select value={marginKm} onChange={(event) => setMarginKm(Number(event.target.value))}>
                      {MARGIN_OPTIONS_KM.map((km) => <option key={km} value={km}>{km} km</option>)}
                    </select>
                  </label>
                )}
                <label>
                  <input type="radio" name="pole-area" checked={effectiveMode === 'all'} onChange={() => setAreaMode('all')} />
                  <span>Todo el archivo <small>{allPoles.length.toLocaleString()} postes</small></span>
                </label>
              </fieldset>

              <div className="pole-preview-summary">
                <strong>{selected.length.toLocaleString()}</strong>
                <span>de {allPoles.length.toLocaleString()} postes en la zona elegida</span>
                <button type="button" className="btn-primary" onClick={importPoles} disabled={importing || selected.length === 0}>{importing ? 'Importando...' : `Importar ${selected.length.toLocaleString()} postes`}</button>
              </div>

              {importProgress && (
                <div className="pole-progress" role="status">
                  <progress value={importPercent ?? 0} max={100} aria-label="Progreso de importación" />
                  <span>Importando… {importProgress.done.toLocaleString()} de {importProgress.total.toLocaleString()} ({importPercent}%)</span>
                  <button type="button" className="pole-clear-button" onClick={() => { cancelImportRef.current = true; }}>Detener</button>
                </div>
              )}

              {selected.length === 0 ? (
                <p className="pole-preview-more">Ningún poste cae dentro de la zona elegida. Aumenta el margen o importa todo el archivo.</p>
              ) : (
                <div className="pole-preview-table-wrap">
                  <table>
                    <thead><tr><th>Código</th><th>Nombre</th><th>Material</th><th>Coordenadas</th></tr></thead>
                    <tbody>{selected.slice(0, 20).map((pole) => <tr key={`${pole.code}-${pole.latitude}-${pole.longitude}`}><td>{pole.code}</td><td>{pole.name}</td><td>{pole.material ?? '—'}</td><td>{pole.latitude.toFixed(6)}, {pole.longitude.toFixed(6)}</td></tr>)}</tbody>
                  </table>
                  {selected.length > 20 && <p className="pole-preview-more">Mostrando 20 de {selected.length.toLocaleString()} postes.</p>}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </section>
  );
}
