import { CreateCableDto } from './create-cable.dto.js';
declare const UpdateCableDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCableDto>>;
export declare class UpdateCableDto extends UpdateCableDto_base {
    status?: string;
    description?: string;
}
export {};
