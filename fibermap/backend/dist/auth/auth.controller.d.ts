import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import type { AuthenticatedUser } from './strategies/jwt.strategy.js';
import { UpdatePreferencesDto } from './dto/update-preferences.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
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
    register(dto: RegisterDto): Promise<{
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
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    me(user: AuthenticatedUser): AuthenticatedUser;
    preferences(user: AuthenticatedUser): Promise<import("../users/users.service.js").UserPreferences>;
    updatePreferences(user: AuthenticatedUser, dto: UpdatePreferencesDto): Promise<import("../users/users.service.js").UserPreferences>;
}
