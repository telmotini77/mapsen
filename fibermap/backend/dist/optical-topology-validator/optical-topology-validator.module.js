var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module, Global } from '@nestjs/common';
import { OpticalTopologyValidatorService } from './optical-topology-validator.service.js';
let OpticalTopologyValidatorModule = class OpticalTopologyValidatorModule {
};
OpticalTopologyValidatorModule = __decorate([
    Global(),
    Module({
        providers: [OpticalTopologyValidatorService],
        exports: [OpticalTopologyValidatorService]
    })
], OpticalTopologyValidatorModule);
export { OpticalTopologyValidatorModule };
//# sourceMappingURL=optical-topology-validator.module.js.map