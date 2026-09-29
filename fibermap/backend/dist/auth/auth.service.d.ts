import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            roles: string[];
            permissions: string[];
        };
        accessToken: string;
        refreshToken: string;
    }>;
    register(name: string, email: string, password: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            roles: string[];
            permissions: string[];
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getPreferences(userId: string): Promise<import("../users/users.service.js").UserPreferences>;
    updatePreferences(userId: string, preferences: Parameters<UsersService['updatePreferences']>[1]): Promise<import("../users/users.service.js").UserPreferences>;
    private buildPayload;
    private signTokens;
}
