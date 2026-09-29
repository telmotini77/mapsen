export declare class CreateOpticalConnectionDto {
    boxId: string;
    sourceType: string;
    sourceId: string;
    targetType: string;
    targetId: string;
    sourceFiberId?: string;
    targetFiberId?: string;
    connectionType?: string;
    lossDb?: number;
    notes?: string;
}
