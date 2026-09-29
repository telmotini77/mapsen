var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
let PrismaService = PrismaService_1 = class PrismaService extends PrismaClient {
    constructor() {
        super({});
    }
    logger = new Logger(PrismaService_1.name);
    async onModuleInit() {
        const maxAttempts = 15;
        for (let attempt = 1;; attempt += 1) {
            try {
                await this.$connect();
                return;
            }
            catch (error) {
                if (attempt >= maxAttempts)
                    throw error;
                this.logger.warn(`Base de datos no disponible (intento ${attempt}/${maxAttempts}). Reintentando en 2 s...`);
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
PrismaService = PrismaService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], PrismaService);
export { PrismaService };
//# sourceMappingURL=prisma.service.js.map