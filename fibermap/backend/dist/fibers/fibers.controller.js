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
import { Controller, Get, Body, Patch, Param, Put } from '@nestjs/common';
import { FibersService } from './fibers.service.js';
import { UpdateFiberConfigurationDto } from './dto/update-fiber-configuration.dto.js';
import { SetFiberTerminationsDto } from './dto/set-fiber-terminations.dto.js';
let FibersController = class FibersController {
    fibersService;
    constructor(fibersService) {
        this.fibersService = fibersService;
    }
    assignmentOptions(cableId) {
        return this.fibersService.assignmentOptions(cableId);
    }
    assignmentsForBox(boxId) {
        return this.fibersService.assignmentsForBox(boxId);
    }
    configure(id, dto) {
        return this.fibersService.configure(id, dto);
    }
    setTerminations(id, dto) {
        return this.fibersService.setTerminations(id, dto);
    }
};
__decorate([
    Get('cable/:cableId/assignment-options'),
    __param(0, Param('cableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FibersController.prototype, "assignmentOptions", null);
__decorate([
    Get('box/:boxId/assignments'),
    __param(0, Param('boxId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FibersController.prototype, "assignmentsForBox", null);
__decorate([
    Patch(':id/configuration'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateFiberConfigurationDto]),
    __metadata("design:returntype", void 0)
], FibersController.prototype, "configure", null);
__decorate([
    Put(':id/terminations'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SetFiberTerminationsDto]),
    __metadata("design:returntype", void 0)
], FibersController.prototype, "setTerminations", null);
FibersController = __decorate([
    Controller('fibers'),
    __metadata("design:paramtypes", [FibersService])
], FibersController);
export { FibersController };
//# sourceMappingURL=fibers.controller.js.map