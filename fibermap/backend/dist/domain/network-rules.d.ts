export declare const FIBER_COUNTS: readonly [6, 12, 24, 48];
export declare const BOX_TYPES: readonly ["NAP", "MANGA"];
export declare const MANGA_TYPES: readonly ["DISTRIBUCION", "PASO", "EMPALME"];
export declare const SPLITTER_RATIOS: readonly ["1:8", "1:16"];
export declare const MANGA_SPLITTER_RATIO = "1:8";
export declare const NAP_SPLITTER_RATIOS: readonly string[];
export declare const NAP_MAX_SPLITTER_OUTPUTS = 16;
export declare const splitterOutputs: (ratio: string) => number;
export declare const tubeLayout: (fiberCount: number) => {
    fibersPerTube: number;
    tubeCount: number;
};
export declare const FIBER_COLOR_CODE: readonly ["BLUE", "ORANGE", "GREEN", "BROWN", "SLATE", "WHITE", "RED", "BLACK", "YELLOW", "VIOLET", "PINK", "AQUA"];
export declare const fiberColorAt: (position: number) => "BLUE" | "ORANGE" | "GREEN" | "BROWN" | "SLATE" | "WHITE" | "RED" | "BLACK" | "YELLOW" | "VIOLET" | "PINK" | "AQUA";
export declare const CENTER_TOLERANCE_METERS = 2;
export declare const POLE_VERTEX_TOLERANCE_METERS = 2;
export declare const NAP_POLE_TOLERANCE_METERS = 5;
export declare const CABLE_CONNECTION_TYPES: readonly ["SPLICE", "CONNECTOR", "PATCH", "DIRECT"];
export declare const DEFAULT_CABLE_COLOR = "#ef4444";
export declare const CABLE_FIBER_COUNTS: readonly [2, 6, 12, 24, 48];
export declare const FIBER_COLOR_BY_COUNT: Record<number, string>;
export declare const cableTypeFor: (fiberCount: number) => "DROP" | "DISTRIBUTION";
export declare const defaultCableColor: (fiberCount: number) => string;
export declare const DEFAULT_CABLE_CONNECTION: {
    readonly connectionType: "SPLICE";
    readonly lossDb: 0.1;
};
