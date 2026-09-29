var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module, Global } from '@nestjs/common';
import { OpticalContinuityEngineService } from './optical-continuity-engine.service.js';
import { OpticalContinuityEngineController } from './optical-continuity-engine.controller.js';
let OpticalContinuityEngineModule = class OpticalContinuityEngineModule {
};
OpticalContinuityEngineModule = __decorate([
    Global(),
    Module({
        controllers: [OpticalContinuityEngineController],
        providers: [OpticalContinuityEngineService],
        exports: [OpticalContinuityEngineService]
    })
], OpticalContinuityEngineModule);
export { OpticalContinuityEngineModule };
//# sourceMappingURL=optical-continuity-engine.module.js.map