export declare class CablePointDto {
    lat: number;
    lng: number;
}
export declare class CreateCableDto {
    code?: string;
    name?: string;
    fiberCount: number;
    points: CablePointDto[];
    color?: string;
}
