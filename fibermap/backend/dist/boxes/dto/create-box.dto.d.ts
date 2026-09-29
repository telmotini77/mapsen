export declare class CreateBoxDto {
    name: string;
    type: string;
    mangaType?: string;
    capacity?: number;
    splitterRatio?: string;
    lat: number;
    lng: number;
}
export declare class UpdateBoxDto {
    name?: string;
    status?: string;
    mangaType?: string;
    capacity?: number;
    latitude?: number;
    longitude?: number;
}
