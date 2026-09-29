var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async login(email, password) {
        const user = await this.usersService.findByEmailWithCredentials(email);
        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        await this.usersService.touchLastLogin(user.id);
        const payload = this.buildPayload(user);
        return {
            ...this.signTokens(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: payload.roles,
                permissions: payload.permissions,
            },
        };
    }
    async register(name, email, password) {
        const created = await this.usersService.create({ name, email, password, roleNames: ['VIEWER'] });
        const user = await this.usersService.findByEmailWithCredentials(created.email);
        if (!user) {
            throw new UnauthorizedException('No se pudo completar el registro');
        }
        const payload = this.buildPayload(user);
        return {
            ...this.signTokens(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: payload.roles,
                permissions: payload.permissions,
            },
        };
    }
    async refresh(refreshToken) {
        let decoded;
        try {
            decoded = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        }
        catch {
            throw new UnauthorizedException('Refresh token inválido o expirado');
        }
        const user = await this.usersService.findByEmailWithCredentials(decoded.email);
        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Usuario no encontrado o inactivo');
        }
        return this.signTokens(this.buildPayload(user));
    }
    getPreferences(userId) {
        return this.usersService.getPreferences(userId);
    }
    updatePreferences(userId, preferences) {
        return this.usersService.updatePreferences(userId, preferences);
    }
    buildPayload(user) {
        return {
            sub: user.id,
            email: user.email,
            roles: user.roles.map((r) => r.name),
            permissions: [...new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.name)))],
        };
    }
    signTokens(payload) {
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'),
        });
        return { accessToken, refreshToken };
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        JwtService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map