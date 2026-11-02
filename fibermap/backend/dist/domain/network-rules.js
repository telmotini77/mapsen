import { BadRequestException } from '@nestjs/common';
export const FIBER_COUNTS = [6, 12, 24, 48];
export const BOX_TYPES = ['NAP', 'MANGA'];
export const MANGA_TYPES = ['DISTRIBUCION', 'DISTRIBUCION_NORMAL', 'PASO', 'EMPALME'];
export const SPLITTER_RATIOS = ['1:8', '1:16'];
export const MANGA_SPLITTER_RATIO = '1:8';
export const NAP_SPLITTER_RATIOS = ['1:8', '1:16'];
export const NAP_MAX_SPLITTER_OUTPUTS = 16;
export const splitterOutputs = (ratio) => Number(ratio.split(':')[1]);
export const tubeLayout = (fiberCount) => {
    const fibersPerTube = fiberCount >= 48 ? 12 : Math.min(fiberCount, 6);
    return { fibersPerTube, tubeCount: Math.ceil(fiberCount / fibersPerTube) };
};
export const FIBER_COLOR_CODE = [
    'BLUE', 'ORANGE', 'GREEN', 'BROWN', 'SLATE', 'WHITE',
    'RED', 'BLACK', 'YELLOW', 'VIOLET', 'PINK', 'AQUA',
];
export const fiberColorAt = (position) => FIBER_COLOR_CODE[(position - 1) % FIBER_COLOR_CODE.length];
export const CENTER_TOLERANCE_METERS = 2;
export const POLE_VERTEX_TOLERANCE_METERS = 2;
export const NAP_POLE_TOLERANCE_METERS = 5;
export const CABLE_CONNECTION_TYPES = ['SPLICE', 'CONNECTOR', 'PATCH', 'DIRECT'];
export const DEFAULT_CABLE_COLOR = '#ef4444';
export const CABLE_FIBER_COUNTS = [2, 6, 12, 24, 48];
export const FIBER_COLOR_BY_COUNT = {
    2: '#111827',
    6: '#ec4899',
    12: '#3b82f6',
    24: '#22c55e',
    48: '#8b4513',
};
export const cableTypeFor = (fiberCount) => (fiberCount === 2 ? 'DROP' : 'DISTRIBUTION');
export const defaultCableColor = (fiberCount) => FIBER_COLOR_BY_COUNT[fiberCount] ?? DEFAULT_CABLE_COLOR;
export const DEFAULT_CABLE_CONNECTION = {
    connectionType: 'SPLICE',
    lossDb: 0.1,
};
export function defaultFiberRanges(stops, fiberCount) {
    if (!CABLE_FIBER_COUNTS.includes(fiberCount))
        throw new BadRequestException('Cantidad de hilos no permitida');
    for (const stop of stops) {
        const r = stop.existing;
        if (r && (!Number.isInteger(r.fiberFrom) || !Number.isInteger(r.fiberTo) || r.fiberFrom < 1 || r.fiberTo < r.fiberFrom || r.fiberTo > fiberCount)) {
            throw new BadRequestException('El rango guardado está fuera de la capacidad de la fibra');
        }
    }
    const reserved = new Set();
    for (const stop of stops)
        if (stop.kind === 'NAP' && stop.existing) {
            for (let n = stop.existing.fiberFrom; n <= stop.existing.fiberTo; n++)
                reserved.add(n);
        }
    const dropped = new Set();
    let fedFromUpstream = false;
    return stops.map((stop, index) => {
        let range;
        if (stop.existing) {
            range = { ...stop.existing };
        }
        else if (stop.kind === 'NAP') {
            const free = Array.from({ length: fiberCount }, (_, i) => i + 1).find((n) => !dropped.has(n) && !reserved.has(n));
            if (free === undefined)
                throw new BadRequestException('No hay hilos disponibles para otra caja NAP');
            range = { fiberFrom: free, fiberTo: free };
        }
        else if (index > 0 && fedFromUpstream && dropped.size > 0) {
            const available = longestFreeRun(dropped, fiberCount);
            if (!available)
                throw new BadRequestException('No hay hilos disponibles para continuar hacia la manga u ODF');
            range = available;
        }
        else {
            range = { fiberFrom: 1, fiberTo: fiberCount };
        }
        if (stop.kind === 'NAP') {
            for (let n = range.fiberFrom; n <= range.fiberTo; n++)
                dropped.add(n);
        }
        else {
            fedFromUpstream = true;
        }
        return range;
    });
}
function longestFreeRun(taken, fiberCount) {
    let best = null;
    let start = null;
    for (let n = 1; n <= fiberCount + 1; n++) {
        const free = n <= fiberCount && !taken.has(n);
        if (free && start === null)
            start = n;
        if (!free && start !== null) {
            if (!best || n - start > best.fiberTo - best.fiberFrom + 1)
                best = { fiberFrom: start, fiberTo: n - 1 };
            start = null;
        }
    }
    return best;
}
export const isNormalManga = (type) => ['DISTRIBUCION_NORMAL', 'PASO', 'EMPALME'].includes(type ?? '');
//# sourceMappingURL=network-rules.js.map