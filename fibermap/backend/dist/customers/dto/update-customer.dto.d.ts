import { CreateCustomerDto } from './create-customer.dto.js';
declare const UpdateCustomerDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCustomerDto>>;
export declare class UpdateCustomerDto extends UpdateCustomerDto_base {
    status?: string;
}
export {};
