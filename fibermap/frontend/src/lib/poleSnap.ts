export interface PolePoint {
  lat: number;
  lng: number;
  code: string;
}

// Lo mínimo que se usa del mapa: pasar entre coordenadas geográficas y píxeles de pantalla.
export interface ProjectingMap {
  project(lngLat: [number, number]): { x: number; y: number };
  unproject(point: [number, number]): { lat: number; lng: number };
}

// Poste más cercano a un punto de la pantalla, dentro de `radiusPx` píxeles. Con cientos de miles de
// postes solo se proyectan los que caen en el cuadro del radio (no todos), así que sirve también
// para seguir el cursor en cada movimiento del ratón.
export function nearestPole(poles: PolePoint[], point: { x: number; y: number }, radiusPx: number, map: ProjectingMap): PolePoint | null {
  const corners = [
    map.unproject([point.x - radiusPx, point.y - radiusPx]),
    map.unproject([point.x + radiusPx, point.y - radiusPx]),
    map.unproject([point.x - radiusPx, point.y + radiusPx]),
    map.unproject([point.x + radiusPx, point.y + radiusPx]),
  ];
  const south = Math.min(...corners.map((c) => c.lat));
  const north = Math.max(...corners.map((c) => c.lat));
  const west = Math.min(...corners.map((c) => c.lng));
  const east = Math.max(...corners.map((c) => c.lng));

  let best: { pole: PolePoint; distance: number } | null = null;
  for (const pole of poles) {
    if (pole.lat < south || pole.lat > north || pole.lng < west || pole.lng > east) continue;
    const projected = map.project([pole.lng, pole.lat]);
    const distance = Math.hypot(projected.x - point.x, projected.y - point.y);
    if (distance <= radiusPx && (!best || distance < best.distance)) best = { pole, distance };
  }
  return best?.pole ?? null;
}
