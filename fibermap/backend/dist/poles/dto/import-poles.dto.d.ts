export declare class ImportedPoleDto {
    code: string;
    name?: string;
    latitude: number;
    longitude: number;
    material?: string;
    owner?: string;
    notes?: string;
    description?: string;
}
export declare class ImportPolesDto {
    poles: ImportedPoleDto[];
}
