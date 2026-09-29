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
import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { SplittersService } from './splitters.service.js';
import { UpdateSplitterDto } from './dto/update-splitter.dto.js';
import { CreateSplitterDto } from './dto/create-splitter.dto.js';
let SplittersController = class SplittersController {
    splittersService;
    constructor(splittersService) {
        this.splittersService = splittersService;
    }
    create(dto) {
        return this.splittersService.create(dto);
    }
    findAll(boxId) {
        return this.splittersService.findAll({ boxId });
    }
    findOne(id) {
        return this.splittersService.findOne(id);
    }
    occupation(id) {
        return this.splittersService.calculateSplitterOccupation(id);
    }
    update(id, updateSplitterDto) {
        return this.splittersService.update(id, updateSplitterDto);
    }
    remove(id, force) {
        return this.splittersService.remove(id, force === 'true');
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSplitterDto]),
    __metadata("design:returntype", void 0)
], SplittersController.prototype, "create", null);
__decorate([
    Get(),
    __param(0, Query('boxId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SplittersController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SplittersController.prototype, "findOne", null);
__decorate([
    Get(':id/occupation'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SplittersController.prototype, "occupation", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateSplitterDto]),
    __metadata("design:returntype", void 0)
], SplittersController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __param(1, Query('force')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SplittersController.prototype, "remove", null);
SplittersController = __decorate([
    Controller('splitters'),
    __metadata("design:paramtypes", [SplittersService])
], SplittersController);
export { SplittersController };
//# sourceMappingURL=splitters.controller.js.map