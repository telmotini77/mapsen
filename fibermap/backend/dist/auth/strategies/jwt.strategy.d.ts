import { Strategy } from 'passport-jwt';
export interface JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    permissions: string[];
}
export interface AuthenticatedUser {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): AuthenticatedUser;
}
export {};
