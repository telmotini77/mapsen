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
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoxesService } from './boxes.service.js';
import { CreateBoxDto, UpdateBoxDto } from './dto/create-box.dto.js';
let BoxesController = class BoxesController {
    boxesService;
    constructor(boxesService) {
        this.boxesService = boxesService;
    }
    create(createBoxDto) {
        return this.boxesService.create(createBoxDto);
    }
    findAll() {
        return this.boxesService.findAll();
    }
    table(id) {
        return this.boxesService.table(id);
    }
    findOne(id) {
        return this.boxesService.findOne(id);
    }
    update(id, updateBoxDto) {
        return this.boxesService.update(id, updateBoxDto);
    }
    generatePorts(id, body) {
        return this.boxesService.generatePorts(id, body.count, body.type);
    }
    remove(id) {
        return this.boxesService.remove(id);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateBoxDto]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "create", null);
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "findAll", null);
__decorate([
    Get(':id/table'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "table", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateBoxDto]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "update", null);
__decorate([
    Post(':id/ports'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "generatePorts", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "remove", null);
BoxesController = __decorate([
    Controller('boxes'),
    __metadata("design:paramtypes", [BoxesService])
], BoxesController);
export { BoxesController };
//# sourceMappingURL=boxes.controller.js.map