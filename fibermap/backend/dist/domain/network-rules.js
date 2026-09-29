export const FIBER_COUNTS = [6, 12, 24, 48];
export const BOX_TYPES = ['NAP', 'MANGA'];
export const MANGA_TYPES = ['DISTRIBUCION', 'PASO', 'EMPALME'];
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
//# sourceMappingURL=network-rules.js.map