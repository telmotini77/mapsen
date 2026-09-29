var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Param } from '@nestjs/common';
import { OpticalContinuityEngineService } from './optical-continuity-engine.service.js';
let OpticalContinuityEngineController = class OpticalContinuityEngineController {
    engine;
    constructor(engine) {
        this.engine = engine;
    }
    traceFromTermination(id) {
        return this.engine.traceFiber(id);
    }
    traceFromPon(ponId) {
        return this.engine.traceFromPon(ponId);
    }
};
__decorate([
    Get('termination/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OpticalContinuityEngineController.prototype, "traceFromTermination", null);
__decorate([
    Get('pon/:ponId'),
    __param(0, Param('ponId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OpticalContinuityEngineController.prototype, "traceFromPon", null);
OpticalContinuityEngineController = __decorate([
    Controller('optical-trace'),
    __metadata("design:paramtypes", [OpticalContinuityEngineService])
], OpticalContinuityEngineController);
export { OpticalContinuityEngineController };
//# sourceMappingURL=optical-continuity-engine.controller.js.map