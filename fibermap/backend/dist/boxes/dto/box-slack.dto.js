var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';
export class UpdateBoxSlackDto {
    meters;
}
__decorate([
    IsNumber({ allowNaN: false, allowInfinity: false }),
    IsPositive(),
    __metadata("design:type", Number)
], UpdateBoxSlackDto.prototype, "meters", void 0);
export class CreateBoxSlackDto extends UpdateBoxSlackDto {
    cableId;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateBoxSlackDto.prototype, "cableId", void 0);
//# sourceMappingURL=box-slack.dto.js.map