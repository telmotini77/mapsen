var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { PolesModule } from '../poles/poles.module.js';
import { ConnectionsTableModule } from '../cables/connections-table.module.js';
import { BoxesService } from './boxes.service.js';
import { BoxesController } from './boxes.controller.js';
let BoxesModule = class BoxesModule {
};
BoxesModule = __decorate([
    Module({
        imports: [PolesModule, ConnectionsTableModule],
        controllers: [BoxesController],
        providers: [BoxesService],
    })
], BoxesModule);
export { BoxesModule };
//# sourceMappingURL=boxes.module.js.map