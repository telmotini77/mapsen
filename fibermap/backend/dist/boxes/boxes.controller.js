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
import { BoxSlacksService } from './box-slacks.service.js';
import { CreateBoxSlackDto, UpdateBoxSlackDto } from './dto/box-slack.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoxesService } from './boxes.service.js';
import { CreateBoxDto, UpdateBoxDto } from './dto/create-box.dto.js';
let BoxesController = class BoxesController {
    boxesService;
    slacks;
    constructor(boxesService, slacks) {
        this.boxesService = boxesService;
        this.slacks = slacks;
    }
    create(createBoxDto) {
        return this.boxesService.create(createBoxDto);
    }
    findAll() {
        return this.boxesService.findAll();
    }
    mapSlacks() { return this.slacks.map(); }
    listSlacks(id) { return this.slacks.list(id); }
    createSlack(id, dto) { return this.slacks.create(id, dto); }
    updateSlack(id, slackId, dto) { return this.slacks.update(id, slackId, dto); }
    removeSlack(id, slackId) { return this.slacks.remove(id, slackId); }
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
    Get('slacks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "mapSlacks", null);
__decorate([
    Get(':id/slacks'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "listSlacks", null);
__decorate([
    Roles('ADMIN', 'OPERATOR'),
    Post(':id/slacks'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateBoxSlackDto]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "createSlack", null);
__decorate([
    Roles('ADMIN', 'OPERATOR'),
    Patch(':id/slacks/:slackId'),
    __param(0, Param('id')),
    __param(1, Param('slackId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpdateBoxSlackDto]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "updateSlack", null);
__decorate([
    Roles('ADMIN', 'OPERATOR'),
    Delete(':id/slacks/:slackId'),
    __param(0, Param('id')),
    __param(1, Param('slackId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BoxesController.prototype, "removeSlack", null);
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
    __metadata("design:paramtypes", [BoxesService, BoxSlacksService])
], BoxesController);
export { BoxesController };
//# sourceMappingURL=boxes.controller.js.map