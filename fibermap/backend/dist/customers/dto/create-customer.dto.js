var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEmail, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateCustomerDto {
    projectId;
    code;
    name;
    documentId;
    phone;
    email;
    address;
    latitude;
    longitude;
    notes;
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "projectId", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "code", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "documentId", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "phone", void 0);
__decorate([
    IsOptional(),
    IsEmail(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "email", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "address", void 0);
__decorate([
    IsLatitude(),
    __metadata("design:type", Number)
], CreateCustomerDto.prototype, "latitude", void 0);
__decorate([
    IsLongitude(),
    __metadata("design:type", Number)
], CreateCustomerDto.prototype, "longitude", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "notes", void 0);
//# sourceMappingURL=create-customer.dto.js.map