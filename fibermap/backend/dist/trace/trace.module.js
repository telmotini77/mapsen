var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConnectionsTableModule } from '../cables/connections-table.module.js';
import { TraceService } from './trace.service.js';
import { TraceController } from './trace.controller.js';
let TraceModule = class TraceModule {
};
TraceModule = __decorate([
    Module({
        imports: [ConnectionsTableModule],
        controllers: [TraceController],
        providers: [TraceService],
    })
], TraceModule);
export { TraceModule };
//# sourceMappingURL=trace.module.js.map