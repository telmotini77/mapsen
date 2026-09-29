var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';
const omittable = () => ValidateIf((_, value) => value !== undefined);
export class CreateOdfDto {
    code;
    name;
    latitude;
    longitude;
    capacity;
    description;
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateOdfDto.prototype, "code", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateOdfDto.prototype, "name", void 0);
__decorate([
    Type(() => Number),
    IsLatitude(),
    __metadata("design:type", Number)
], CreateOdfDto.prototype, "latitude", void 0);
__decorate([
    Type(() => Number),
    IsLongitude(),
    __metadata("design:type", Number)
], CreateOdfDto.prototype, "longitude", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(144),
    __metadata("design:type", Number)
], CreateOdfDto.prototype, "capacity", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateOdfDto.prototype, "description", void 0);
export class UpdateOdfDto {
    name;
    latitude;
    longitude;
    status;
    description;
}
__decorate([
    omittable(),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], UpdateOdfDto.prototype, "name", void 0);
__decorate([
    omittable(),
    Type(() => Number),
    IsLatitude(),
    __metadata("design:type", Number)
], UpdateOdfDto.prototype, "latitude", void 0);
__decorate([
    omittable(),
    Type(() => Number),
    IsLongitude(),
    __metadata("design:type", Number)
], UpdateOdfDto.prototype, "longitude", void 0);
__decorate([
    omittable(),
    IsIn(['ACTIVE', 'INACTIVE']),
    __metadata("design:type", String)
], UpdateOdfDto.prototype, "status", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateOdfDto.prototype, "description", void 0);
//# sourceMappingURL=create-odf.dto.js.map