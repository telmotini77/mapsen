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
import { IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
const TERMINATION_TYPES = ['BOX_PORT', 'SPLITTER_INPUT', 'SPLITTER_OUTPUT', 'ODF_PORT'];
export class FiberTerminalDto {
    type;
    entityId;
    boxId;
    portIdentifier;
}
__decorate([
    IsIn(TERMINATION_TYPES),
    __metadata("design:type", String)
], FiberTerminalDto.prototype, "type", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], FiberTerminalDto.prototype, "entityId", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], FiberTerminalDto.prototype, "boxId", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], FiberTerminalDto.prototype, "portIdentifier", void 0);
export class SetFiberTerminationsDto {
    source;
    target;
}
__decorate([
    ValidateNested(),
    Type(() => FiberTerminalDto),
    __metadata("design:type", FiberTerminalDto)
], SetFiberTerminationsDto.prototype, "source", void 0);
__decorate([
    ValidateNested(),
    Type(() => FiberTerminalDto),
    __metadata("design:type", FiberTerminalDto)
], SetFiberTerminationsDto.prototype, "target", void 0);
//# sourceMappingURL=set-fiber-terminations.dto.js.map