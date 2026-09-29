// Código de 12 colores de la fibra óptica. El backend guarda el nombre en inglés (BLUE, ORANGE...).
const COLOR_HEX: Record<string, string> = {
  BLUE: '#2563eb', ORANGE: '#f97316', GREEN: '#16a34a', BROWN: '#854d0e', SLATE: '#94a3b8', WHITE: '#ffffff',
  RED: '#dc2626', BLACK: '#111827', YELLOW: '#eab308', VIOLET: '#7c3aed', PINK: '#ec4899', AQUA: '#06b6d4',
};

const COLOR_LABEL: Record<string, string> = {
  BLUE: 'Azul', ORANGE: 'Naranja', GREEN: 'Verde', BROWN: 'Café', SLATE: 'Gris', WHITE: 'Blanco',
  RED: 'Rojo', BLACK: 'Negro', YELLOW: 'Amarillo', VIOLET: 'Violeta', PINK: 'Rosa', AQUA: 'Celeste',
};

export const fiberColorHex = (color: string) => COLOR_HEX[color] ?? '#94a3b8';
export const fiberColorLabel = (color: string) => COLOR_LABEL[color] ?? color;

// Texto negro o blanco, el que más contraste tenga sobre el color de fondo.
export function textOnColor(color: string) {
  const hex = fiberColorHex(color).replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
  return luminance > 0.4 ? '#0f172a' : '#ffffff';
}

const STATUS_SERVICE: Record<string, string> = {
  FREE: 'DISPONIBLE', USED: 'EN USO', RESERVED: 'RESERVADO', DAMAGED: 'DAÑADO', DISCONNECTED: 'DESCONECTADO', TEST: 'PRUEBA',
};

// Lo que dice la columna "Servicio": la etiqueta del hilo (p. ej. "TO OLT ESTADIO") o, si no tiene, su estado.
export const serviceText = (label: string | null | undefined, status: string) =>
  label?.trim() ? label.trim().toUpperCase() : STATUS_SERVICE[status] ?? status;
