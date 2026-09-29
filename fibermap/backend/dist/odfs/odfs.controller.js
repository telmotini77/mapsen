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
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { OdfsService } from './odfs.service.js';
import { CreateOdfDto, UpdateOdfDto } from './dto/create-odf.dto.js';
let OdfsController = class OdfsController {
    odfsService;
    constructor(odfsService) {
        this.odfsService = odfsService;
    }
    create(dto) { return this.odfsService.create(dto); }
    findAll() { return this.odfsService.findAll(); }
    table(id) { return this.odfsService.table(id); }
    findOne(id) { return this.odfsService.findOne(id); }
    update(id, dto) { return this.odfsService.update(id, dto); }
    remove(id) { return this.odfsService.remove(id); }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateOdfDto]),
    __metadata("design:returntype", void 0)
], OdfsController.prototype, "create", null);
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OdfsController.prototype, "findAll", null);
__decorate([
    Get(':id/table'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OdfsController.prototype, "table", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OdfsController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateOdfDto]),
    __metadata("design:returntype", void 0)
], OdfsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OdfsController.prototype, "remove", null);
OdfsController = __decorate([
    Controller('odfs'),
    __metadata("design:paramtypes", [OdfsService])
], OdfsController);
export { OdfsController };
//# sourceMappingURL=odfs.controller.js.map