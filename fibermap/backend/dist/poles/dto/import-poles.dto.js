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
import { ArrayMaxSize, IsArray, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
export class ImportedPoleDto {
    code;
    name;
    latitude;
    longitude;
    material;
    owner;
    notes;
    description;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    MaxLength(120),
    __metadata("design:type", String)
], ImportedPoleDto.prototype, "code", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(200),
    __metadata("design:type", String)
], ImportedPoleDto.prototype, "name", void 0);
__decorate([
    Type(() => Number),
    IsLatitude(),
    __metadata("design:type", Number)
], ImportedPoleDto.prototype, "latitude", void 0);
__decorate([
    Type(() => Number),
    IsLongitude(),
    __metadata("design:type", Number)
], ImportedPoleDto.prototype, "longitude", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(60),
    __metadata("design:type", String)
], ImportedPoleDto.prototype, "material", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(120),
    __metadata("design:type", String)
], ImportedPoleDto.prototype, "owner", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(1000),
    __metadata("design:type", String)
], ImportedPoleDto.prototype, "notes", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(1000),
    __metadata("design:type", String)
], ImportedPoleDto.prototype, "description", void 0);
export class ImportPolesDto {
    poles;
}
__decorate([
    IsArray(),
    ArrayMaxSize(5000),
    ValidateNested({ each: true }),
    Type(() => ImportedPoleDto),
    __metadata("design:type", Array)
], ImportPolesDto.prototype, "poles", void 0);
//# sourceMappingURL=import-poles.dto.js.map