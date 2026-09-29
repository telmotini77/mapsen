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
import { IsIn, IsInt, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
const omittable = () => ValidateIf((_, value) => value !== undefined);
import { BOX_TYPES, FIBER_COUNTS, MANGA_TYPES, SPLITTER_RATIOS } from '../../domain/network-rules.js';
export class CreateBoxDto {
    name;
    type;
    mangaType;
    capacity;
    splitterRatio;
    lat;
    lng;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateBoxDto.prototype, "name", void 0);
__decorate([
    IsIn(BOX_TYPES),
    __metadata("design:type", String)
], CreateBoxDto.prototype, "type", void 0);
__decorate([
    ValidateIf((o) => o.type === 'MANGA'),
    IsIn(MANGA_TYPES),
    __metadata("design:type", String)
], CreateBoxDto.prototype, "mangaType", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt(),
    IsIn(FIBER_COUNTS),
    __metadata("design:type", Number)
], CreateBoxDto.prototype, "capacity", void 0);
__decorate([
    IsOptional(),
    IsIn(SPLITTER_RATIOS),
    __metadata("design:type", String)
], CreateBoxDto.prototype, "splitterRatio", void 0);
__decorate([
    Type(() => Number),
    IsLatitude(),
    __metadata("design:type", Number)
], CreateBoxDto.prototype, "lat", void 0);
__decorate([
    Type(() => Number),
    IsLongitude(),
    __metadata("design:type", Number)
], CreateBoxDto.prototype, "lng", void 0);
export class UpdateBoxDto {
    name;
    status;
    mangaType;
    capacity;
    latitude;
    longitude;
}
__decorate([
    omittable(),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], UpdateBoxDto.prototype, "name", void 0);
__decorate([
    omittable(),
    IsIn(['ACTIVE', 'INACTIVE']),
    __metadata("design:type", String)
], UpdateBoxDto.prototype, "status", void 0);
__decorate([
    IsOptional(),
    IsIn(MANGA_TYPES),
    __metadata("design:type", String)
], UpdateBoxDto.prototype, "mangaType", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt(),
    IsIn(FIBER_COUNTS),
    __metadata("design:type", Number)
], UpdateBoxDto.prototype, "capacity", void 0);
__decorate([
    omittable(),
    Type(() => Number),
    IsLatitude(),
    __metadata("design:type", Number)
], UpdateBoxDto.prototype, "latitude", void 0);
__decorate([
    omittable(),
    Type(() => Number),
    IsLongitude(),
    __metadata("design:type", Number)
], UpdateBoxDto.prototype, "longitude", void 0);
//# sourceMappingURL=create-box.dto.js.map