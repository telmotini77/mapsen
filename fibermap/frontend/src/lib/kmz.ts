import JSZip from 'jszip';

export interface ParsedPole {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  material?: string;
  owner?: string;
  notes?: string;
}

export interface KmzProgress {
  processedBytes: number;
  totalBytes: number;
  poles: number;
}

export class ImportCancelled extends Error {
  constructor() {
    super('Lectura cancelada.');
    this.name = 'ImportCancelled';
  }
}

// Un KMZ con el inventario de una empresa eléctrica puede descomprimirse a cientos de MB (el de
// ejemplo: 26 MB -> 954 MB). JavaScript no admite textos de más de ~512 MB, así que el KML se lee
// por partes y de cada <Placemark> solo se conserva lo necesario, sin armar nunca el texto completo.
const MAX_PLACEMARK_CHARS = 2_000_000;
const MAX_PARSED_POLES = 600_000;
const END_TAG = '</Placemark>';

const ENTITIES: Record<string, string> = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'" };
const decodeEntities = (text: string) => text.replace(/&(?:lt|gt|amp|quot|apos|#39);/g, (m) => ENTITIES[m] ?? m);

function cleanValue(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const text = decodeEntities(raw).trim();
  return !text || text === '<Null>' ? undefined : text;
}

const FIELD_LABELS = ['CODIGOELEMENTO', 'MIOID', 'Subtipo', 'Propiedad', 'Codigo Estructura', 'Tipo Uso Poste', 'Parroquia', 'Canton', 'Observaciones'] as const;
type FieldLabel = (typeof FIELD_LABELS)[number];
const FIELD_PATTERNS = Object.fromEntries(
  FIELD_LABELS.map((label) => [label, new RegExp(`<td>\\s*${label}\\s*</td>\\s*<td>([^<]*)</td>`, 'i')]),
) as Record<FieldLabel, RegExp>;

const POINT_PATTERN = /<Point[\s>][\s\S]*?<coordinates>\s*([^<]+?)\s*<\/coordinates>/;
const NAME_PATTERN = /<name>([\s\S]*?)<\/name>/;
const DESCRIPTION_PATTERN = /<description>([\s\S]*?)<\/description>/;

function materialOf(subtype: string | undefined): string {
  const text = (subtype ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (text.includes('hormigon')) return 'HORMIGON';
  if (text.includes('madera')) return 'MADERA';
  if (text.includes('plastico')) return 'PLASTICO';
  if (text.includes('metalico')) return 'METALICO';
  if (text.includes('torre')) return 'TORRE';
  return 'OTHER';
}

const slug = (value: string) => value.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 70);

// Convierte un <Placemark> en un poste. Devuelve null si no es un punto (líneas y polígonos se ignoran).
export function parsePlacemark(block: string, index: number): ParsedPole | null {
  const point = POINT_PATTERN.exec(block);
  if (!point) return null;
  const [lonText, latText] = point[1].split(',');
  const longitude = Number(lonText);
  const latitude = Number(latText);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  const rawName = cleanValue(NAME_PATTERN.exec(block)?.[1]);
  const description = (DESCRIPTION_PATTERN.exec(block)?.[1] ?? '').replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '');

  const field = (label: FieldLabel) => cleanValue(FIELD_PATTERNS[label].exec(description)?.[1]);
  const elementCode = field('CODIGOELEMENTO');
  const subtype = field('Subtipo');
  const hasInventoryFields = Boolean(elementCode || subtype);

  if (!hasInventoryFields) {
    // KML genérico: el <name> es el nombre del punto y la descripción (sin etiquetas) son sus notas.
    const plain = decodeEntities(description.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
    const code = slug(rawName ?? '') || `POSTE-${index}`;
    return { code, name: rawName ?? code, latitude, longitude, notes: plain ? plain.slice(0, 500) : undefined };
  }

  // Inventario de empresa eléctrica: el <name> es el usuario que lo creó, no un código de poste.
  const idCode = elementCode ?? field('MIOID');
  const code = idCode ? `P-${slug(idCode)}` : `POSTE-${index}`;
  const notes = [
    field('Canton') && `Cantón ${field('Canton')}`,
    field('Parroquia') && `Parroquia ${field('Parroquia')}`,
    field('Codigo Estructura') && `Estructura ${field('Codigo Estructura')}`,
    field('Tipo Uso Poste') && `Uso: ${field('Tipo Uso Poste')}`,
    field('Observaciones'),
  ].filter(Boolean).join(' · ');

  return {
    code,
    name: `Poste ${idCode ?? index}`,
    latitude,
    longitude,
    material: materialOf(subtype),
    owner: field('Propiedad'),
    notes: notes ? notes.slice(0, 500) : undefined,
  };
}

export interface ExtractState {
  // true mientras se descarta un <Placemark> enorme (p. ej. una línea con miles de vértices).
  skipping: boolean;
}

// Extrae del texto acumulado cada <Placemark> completo y devuelve el resto (un Placemark a medias o
// el final del texto, por si una etiqueta quedó partida entre dos partes). El resto es siempre pequeño.
export function extractPlacemarks(buffer: string, onBlock: (block: string) => void, state: ExtractState): string {
  let pos = 0;
  for (;;) {
    if (state.skipping) {
      const end = buffer.indexOf(END_TAG, pos);
      if (end === -1) return buffer.slice(Math.max(pos, buffer.length - END_TAG.length));
      pos = end + END_TAG.length;
      state.skipping = false;
      continue;
    }
    const start = buffer.indexOf('<Placemark', pos);
    if (start === -1) return buffer.slice(Math.max(pos, buffer.length - '<Placemark'.length));
    const end = buffer.indexOf(END_TAG, start);
    if (end === -1) {
      if (buffer.length - start > MAX_PLACEMARK_CHARS) {
        state.skipping = true;
        return buffer.slice(buffer.length - END_TAG.length);
      }
      return buffer.slice(start);
    }
    onBlock(buffer.slice(start, end + END_TAG.length));
    pos = end + END_TAG.length;
  }
}

interface ParseOptions {
  onProgress?: (progress: KmzProgress) => void;
  signal?: AbortSignal;
}

export async function parseKmz(file: File, { onProgress, signal }: ParseOptions = {}): Promise<{ poles: ParsedPole[]; ignored: number }> {
  const zip = await JSZip.loadAsync(file);
  const entry = Object.values(zip.files).find((item) => !item.dir && item.name.toLowerCase().endsWith('.kml'));
  if (!entry) throw new Error('El KMZ no contiene un archivo KML.');
  // JSZip no expone el tamaño descomprimido en su API pública; se usa solo para la barra de progreso.
  const totalBytes = (entry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0;

  const decoder = new TextDecoder('utf-8');
  const state: ExtractState = { skipping: false };
  const poles: ParsedPole[] = [];
  let placemarks = 0;
  let ignored = 0;
  let buffer = '';
  let processedBytes = 0;
  let lastReport = 0;

  const handle = (block: string) => {
    placemarks += 1;
    const pole = parsePlacemark(block, placemarks);
    if (!pole) {
      ignored += 1;
      return;
    }
    if (poles.length >= MAX_PARSED_POLES) {
      throw new Error(`El archivo tiene más de ${MAX_PARSED_POLES.toLocaleString()} postes. Divídelo en varios KMZ por zona.`);
    }
    poles.push(pole);
  };

  await new Promise<void>((resolve, reject) => {
    // internalStream entrega el KML descomprimido en trozos, sin cargarlo entero en memoria.
    const stream = (entry as unknown as { internalStream: (type: 'uint8array') => any }).internalStream('uint8array');
    stream
      .on('data', (chunk: Uint8Array) => {
        if (signal?.aborted) {
          stream.pause();
          reject(new ImportCancelled());
          return;
        }
        try {
          processedBytes += chunk.length;
          buffer = extractPlacemarks(buffer + decoder.decode(chunk, { stream: true }), handle, state);
        } catch (error) {
          stream.pause();
          reject(error);
          return;
        }
        const now = performance.now();
        if (onProgress && now - lastReport > 150) {
          lastReport = now;
          onProgress({ processedBytes, totalBytes, poles: poles.length });
        }
      })
      .on('error', reject)
      .on('end', () => resolve())
      .resume();
  });

  onProgress?.({ processedBytes: totalBytes || processedBytes, totalBytes, poles: poles.length });
  if (poles.length === 0) throw new Error('No se encontraron puntos (Placemark con Point) válidos en el KMZ.');
  return { poles, ignored };
}
