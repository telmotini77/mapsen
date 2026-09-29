var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
let FiberColorService = class FiberColorService {
    STANDARD_COLORS = [
        'BLUE', 'ORANGE', 'GREEN', 'BROWN', 'SLATE', 'WHITE',
        'RED', 'BLACK', 'YELLOW', 'VIOLET', 'ROSE', 'AQUA'
    ];
    getColorForNumber(num) {
        if (num <= 0)
            return 'UNKNOWN';
        const index = (num - 1) % this.STANDARD_COLORS.length;
        return this.STANDARD_COLORS[index];
    }
    getAllColors() {
        return [...this.STANDARD_COLORS];
    }
};
FiberColorService = __decorate([
    Injectable()
], FiberColorService);
export { FiberColorService };
//# sourceMappingURL=fiber-color.service.js.map