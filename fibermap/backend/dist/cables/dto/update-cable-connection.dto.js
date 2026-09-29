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
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CABLE_CONNECTION_TYPES } from '../../domain/network-rules.js';
export class UpdateCableConnectionDto {
    connectionType;
    fiberFrom;
    fiberTo;
    lossDb;
    notes;
}
__decorate([
    IsOptional(),
    IsIn(CABLE_CONNECTION_TYPES),
    __metadata("design:type", String)
], UpdateCableConnectionDto.prototype, "connectionType", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], UpdateCableConnectionDto.prototype, "fiberFrom", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], UpdateCableConnectionDto.prototype, "fiberTo", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsNumber(),
    Min(0),
    Max(30),
    __metadata("design:type", Number)
], UpdateCableConnectionDto.prototype, "lossDb", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateCableConnectionDto.prototype, "notes", void 0);
//# sourceMappingURL=update-cable-connection.dto.js.map