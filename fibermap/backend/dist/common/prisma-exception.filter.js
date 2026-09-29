var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Catch, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
let PrismaExceptionFilter = class PrismaExceptionFilter {
    logger = new Logger('Prisma');
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        const { status, message } = this.translate(exception);
        if (status >= 500)
            this.logger.error(exception.message);
        response.status(status).json({ statusCode: status, error: HttpStatus[status], message });
    }
    translate(exception) {
        if (exception instanceof Prisma.PrismaClientInitializationError) {
            return { status: HttpStatus.SERVICE_UNAVAILABLE, message: 'No hay conexión con la base de datos. Inténtalo de nuevo en unos segundos.' };
        }
        if (exception instanceof Prisma.PrismaClientValidationError) {
            const field = /Argument `(\w+)`/.exec(exception.message)?.[1];
            this.logger.warn(`Datos inválidos${field ? ` en «${field}»` : ''}: ${exception.message.split('\n').slice(-3).join(' ').trim()}`);
            return {
                status: HttpStatus.BAD_REQUEST,
                message: field ? `Los datos enviados no son válidos: revisa el campo «${field}».` : 'Los datos enviados no son válidos.',
            };
        }
        switch (exception.code) {
            case 'P2002': {
                const target = exception.meta?.target ?? [];
                const fields = Array.isArray(target) ? target.filter((f) => f !== 'projectId').join(', ') : String(target);
                return { status: HttpStatus.CONFLICT, message: `Ya existe un registro con ese valor${fields ? ` (${fields})` : ''}.` };
            }
            case 'P2025':
                return { status: HttpStatus.NOT_FOUND, message: 'El registro solicitado no existe o ya fue eliminado.' };
            case 'P2003':
            case 'P2014':
                return { status: HttpStatus.CONFLICT, message: 'No se puede completar la operación porque el registro está relacionado con otros datos.' };
            case 'P2000':
                return { status: HttpStatus.BAD_REQUEST, message: 'Uno de los valores enviados es demasiado largo.' };
            case 'P1001':
            case 'P1002':
            case 'P1008':
            case 'P1017':
                return { status: HttpStatus.SERVICE_UNAVAILABLE, message: 'No hay conexión con la base de datos. Inténtalo de nuevo en unos segundos.' };
            default:
                return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ocurrió un error inesperado en el servidor.' };
        }
    }
};
PrismaExceptionFilter = __decorate([
    Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError, Prisma.PrismaClientInitializationError)
], PrismaExceptionFilter);
export { PrismaExceptionFilter };
//# sourceMappingURL=prisma-exception.filter.js.map