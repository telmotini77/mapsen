export interface LatLng {
    lat: number;
    lng: number;
}
export interface LocatedElement extends LatLng {
    kind: 'ODF' | 'MANGA' | 'NAP';
    id: string;
    code: string;
    name: string | null;
}
export interface SnappedPoint extends LatLng {
    element?: LocatedElement;
}
export declare function distanceMeters(a: LatLng, b: LatLng): number;
export declare function nearestWithin<T extends LatLng>(point: LatLng, candidates: T[], maxMeters: number): (T & {
    distance: number;
}) | null;
export declare function snapPathToElements(points: LatLng[], elements: LocatedElement[], tolerance: number): SnappedPoint[];
export interface ConnectionPoint {
    element: LocatedElement;
    role: 'START' | 'PASS' | 'END';
    sequence: number;
}
export declare function connectionsFromPath(path: SnappedPoint[]): ConnectionPoint[];
