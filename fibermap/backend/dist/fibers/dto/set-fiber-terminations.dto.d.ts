export declare class FiberTerminalDto {
    type: string;
    entityId: string;
    boxId: string;
    portIdentifier: string;
}
export declare class SetFiberTerminationsDto {
    source: FiberTerminalDto;
    target: FiberTerminalDto;
}
