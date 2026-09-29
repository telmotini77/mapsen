// Zoom (escala de MapLibre) desde el cual se dibujan los postes importados. Más lejos serían una nube
// de puntos ilegible, así que se ocultan. Equivale a ver ~40 m de calle en 100 px.
export const POLE_MIN_ZOOM = 17.4;

// Metros que representa un píxel de pantalla a un zoom y una latitud dados (mapa de 512 px por nivel).
export const metersPerPixel = (zoom: number, latitude: number) =>
  (78271.517 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;

// Escala cartográfica aproximada (1:N) suponiendo una pantalla de 96 ppp.
export const scaleDenominator = (zoom: number, latitude: number) => Math.round(metersPerPixel(zoom, latitude) * 3779.53);

export interface ZoomLevel {
  label: string;
  hint: string;
}

// Descripción en palabras de qué tan cerca del suelo se está.
export function zoomLevel(zoom: number): ZoomLevel {
  if (zoom < 10) return { label: 'Región', hint: 'Vista muy lejana' };
  if (zoom < 13) return { label: 'Ciudad', hint: 'Vista de toda la ciudad' };
  if (zoom < 15) return { label: 'Barrio', hint: 'Vista de barrios' };
  if (zoom < POLE_MIN_ZOOM) return { label: 'Calles', hint: 'Se distinguen las calles' };
  if (zoom < 19) return { label: 'Cerca del suelo', hint: 'Se ven cuadras y postes' };
  return { label: 'Detalle máximo', hint: 'Se ven lotes y aceras' };
}
