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
import { TubesService } from './tubes.service.js';
import { CreateTubeDto } from './dto/create-tube.dto.js';
import { UpdateTubeDto } from './dto/update-tube.dto.js';
let TubesController = class TubesController {
    tubesService;
    constructor(tubesService) {
        this.tubesService = tubesService;
    }
    create(createTubeDto) {
        return this.tubesService.create(createTubeDto);
    }
    findAll() {
        return this.tubesService.findAll();
    }
    findOne(id) {
        return this.tubesService.findOne(+id);
    }
    update(id, updateTubeDto) {
        return this.tubesService.update(+id, updateTubeDto);
    }
    remove(id) {
        return this.tubesService.remove(+id);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTubeDto]),
    __metadata("design:returntype", void 0)
], TubesController.prototype, "create", null);
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TubesController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TubesController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTubeDto]),
    __metadata("design:returntype", void 0)
], TubesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TubesController.prototype, "remove", null);
TubesController = __decorate([
    Controller('tubes'),
    __metadata("design:paramtypes", [TubesService])
], TubesController);
export { TubesController };
//# sourceMappingURL=tubes.controller.js.map