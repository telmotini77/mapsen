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
import { IsIn, IsInt, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
export class CreateProjectDto {
    code;
    name;
    description;
    status;
    centerLatitude;
    centerLongitude;
    defaultZoom;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "code", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "description", void 0);
__decorate([
    IsOptional(),
    IsIn(['PLANNED', 'ACTIVE', 'ARCHIVED']),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "status", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsLatitude(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "centerLatitude", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsLongitude(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "centerLongitude", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(22),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "defaultZoom", void 0);
//# sourceMappingURL=create-project.dto.js.map