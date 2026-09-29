import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './common/prisma-exception.filter.js';
const logger = new Logger('Process');
process.on('unhandledRejection', (reason) => {
    logger.error(`Promesa rechazada sin capturar: ${reason instanceof Error ? reason.stack : String(reason)}`);
});
process.on('uncaughtException', (error) => {
    logger.error(`Excepción sin capturar: ${error.stack ?? error.message}`);
});
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useBodyParser('json', { limit: '10mb' });
    app.enableCors();
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.enableShutdownHooks();
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch((error) => {
    logger.error(`No se pudo iniciar el servidor: ${error instanceof Error ? error.stack : String(error)}`);
    process.exit(1);
});
//# sourceMappingURL=main.js.map