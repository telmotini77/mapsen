import { Module } from '@nestjs/common';
import { ChambersService } from './chambers.service.js';
import { ChambersController } from './chambers.controller.js';

@Module({
  controllers: [ChambersController],
  providers: [ChambersService],
})
export class ChambersModule {}
