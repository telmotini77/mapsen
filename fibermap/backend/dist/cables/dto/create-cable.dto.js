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
import { ArrayMinSize, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { CABLE_FIBER_COUNTS } from '../../domain/network-rules.js';
export class CablePointDto {
    lat;
    lng;
}
__decorate([
    Type(() => Number),
    IsNumber(),
    __metadata("design:type", Number)
], CablePointDto.prototype, "lat", void 0);
__decorate([
    Type(() => Number),
    IsNumber(),
    __metadata("design:type", Number)
], CablePointDto.prototype, "lng", void 0);
export class CreateCableDto {
    code;
    name;
    fiberCount;
    points;
    color;
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCableDto.prototype, "code", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCableDto.prototype, "name", void 0);
__decorate([
    Type(() => Number),
    IsInt(),
    IsIn(CABLE_FIBER_COUNTS),
    __metadata("design:type", Number)
], CreateCableDto.prototype, "fiberCount", void 0);
__decorate([
    IsArray(),
    ArrayMinSize(2),
    ValidateNested({ each: true }),
    Type(() => CablePointDto),
    __metadata("design:type", Array)
], CreateCableDto.prototype, "points", void 0);
__decorate([
    IsOptional(),
    Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color debe ser un color hexadecimal como #ef4444' }),
    __metadata("design:type", String)
], CreateCableDto.prototype, "color", void 0);
//# sourceMappingURL=create-cable.dto.js.map