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
import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ImportPolesDto } from './dto/import-poles.dto.js';
import { PolesService } from './poles.service.js';
let PolesController = class PolesController {
    polesService;
    constructor(polesService) {
        this.polesService = polesService;
    }
    findAll(west, south, east, north, limit) {
        const box = [west, south, east, north];
        const provided = box.filter((value) => value !== undefined).length;
        if (provided !== 0 && provided !== 4) {
            throw new BadRequestException('Para filtrar por zona indica west, south, east y north.');
        }
        const [w, s, e, n] = box.map(Number);
        if (provided === 4 && ![w, s, e, n].every(Number.isFinite)) {
            throw new BadRequestException('west, south, east y north deben ser números.');
        }
        const parsedLimit = limit === undefined ? undefined : Number(limit);
        return this.polesService.findAll(provided === 4 ? { west: w, south: s, east: e, north: n } : undefined, Number.isFinite(parsedLimit) ? parsedLimit : undefined);
    }
    count() { return this.polesService.count(); }
    importFromKmz(dto) { return this.polesService.importFromKmz(dto); }
};
__decorate([
    Get(),
    __param(0, Query('west')),
    __param(1, Query('south')),
    __param(2, Query('east')),
    __param(3, Query('north')),
    __param(4, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PolesController.prototype, "findAll", null);
__decorate([
    Get('count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PolesController.prototype, "count", null);
__decorate([
    Post('import'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ImportPolesDto]),
    __metadata("design:returntype", void 0)
], PolesController.prototype, "importFromKmz", null);
PolesController = __decorate([
    Controller('poles'),
    __metadata("design:paramtypes", [PolesService])
], PolesController);
export { PolesController };
//# sourceMappingURL=poles.controller.js.map