import { useEffect, useState } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { POLE_MIN_ZOOM, scaleDenominator, zoomLevel } from '../lib/mapZoom';
import './MapScaleIndicator.css';

const BAR_MIN_ZOOM = 10;
const BAR_MAX_ZOOM = 20;

interface MapScaleIndicatorProps {
  // false cuando el usuario ocultó los postes en Ajustes.
  polesEnabled: boolean;
}

// Indicador de "qué tan cerca del suelo estoy": nivel de zoom, escala 1:N y una barra que marca a
// partir de dónde se ven los postes. Se suscribe al mapa por su cuenta para que solo este pequeño
// componente se vuelva a dibujar mientras se hace zoom (no toda la aplicación).
export default function MapScaleIndicator({ polesEnabled }: MapScaleIndicatorProps) {
  const { current: mapRef } = useMap();
  const [view, setView] = useState({ zoom: 0, latitude: 0 });

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;
    const update = () => setView({ zoom: map.getZoom(), latitude: map.getCenter().lat });
    update();
    map.on('zoom', update);
    map.on('move', update);
    return () => {
      map.off('zoom', update);
      map.off('move', update);
    };
  }, [mapRef]);

  const level = zoomLevel(view.zoom);
  const percent = (zoom: number) => Math.min(100, Math.max(0, ((zoom - BAR_MIN_ZOOM) / (BAR_MAX_ZOOM - BAR_MIN_ZOOM)) * 100));
  const polesVisible = polesEnabled && view.zoom >= POLE_MIN_ZOOM;

  return (
    <div className="map-scale-indicator" aria-label={`Nivel de zoom ${view.zoom.toFixed(1)}: ${level.label}`}>
      <div className="map-scale-row">
        <strong>{level.label}</strong>
        <span>Zoom {view.zoom.toFixed(1)}</span>
      </div>
      <div className="map-scale-bar" aria-hidden="true">
        <div className="map-scale-fill" style={{ width: `${percent(view.zoom)}%` }} />
        <div className="map-scale-tick" style={{ left: `${percent(POLE_MIN_ZOOM)}%` }} title="Desde aquí se ven los postes" />
      </div>
      <div className="map-scale-row map-scale-small">
        <span>Escala 1:{scaleDenominator(view.zoom, view.latitude).toLocaleString('es')}</span>
        <span className={polesVisible ? 'poles-on' : 'poles-off'}>
          {!polesEnabled ? 'Postes ocultos' : polesVisible ? 'Postes visibles' : 'Acércate para ver postes'}
        </span>
      </div>
    </div>
  );
}
