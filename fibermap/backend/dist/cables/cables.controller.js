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
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CablesService } from './cables.service.js';
import { CreateCableDto } from './dto/create-cable.dto.js';
import { UpdateCableDto } from './dto/update-cable.dto.js';
import { UpdateCableConnectionDto } from './dto/update-cable-connection.dto.js';
let CablesController = class CablesController {
    cablesService;
    constructor(cablesService) {
        this.cablesService = cablesService;
    }
    create(createCableDto) {
        return this.cablesService.create(createCableDto);
    }
    findAll(projectId) {
        return this.cablesService.findAll({ projectId });
    }
    inspection(id) {
        return this.cablesService.inspection(id);
    }
    initializeFibers(id) {
        return this.cablesService.initializeFibers(id);
    }
    findOne(id) {
        return this.cablesService.findOne(id);
    }
    reconnect(id) {
        return this.cablesService.reconnect(id);
    }
    updateConnection(id, connectionId, dto) {
        return this.cablesService.updateConnection(id, connectionId, dto);
    }
    update(id, updateCableDto) {
        return this.cablesService.update(id, updateCableDto);
    }
    remove(id) {
        return this.cablesService.remove(id);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCableDto]),
    __metadata("design:returntype", void 0)
], CablesController.prototype, "create", null);
__decorate([
    Get(),
    __param(0, Query('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CablesController.prototype, "findAll", null);
__decorate([
    Get(':id/inspection'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CablesController.prototype, "inspection", null);
__decorate([
    Post(':id/fibers/initialize'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CablesController.prototype, "initializeFibers", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CablesController.prototype, "findOne", null);
__decorate([
    Post(':id/reconnect'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CablesController.prototype, "reconnect", null);
__decorate([
    Patch(':id/connections/:connectionId'),
    __param(0, Param('id')),
    __param(1, Param('connectionId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpdateCableConnectionDto]),
    __metadata("design:returntype", void 0)
], CablesController.prototype, "updateConnection", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCableDto]),
    __metadata("design:returntype", void 0)
], CablesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CablesController.prototype, "remove", null);
CablesController = __decorate([
    Controller('cables'),
    __metadata("design:paramtypes", [CablesService])
], CablesController);
export { CablesController };
//# sourceMappingURL=cables.controller.js.map