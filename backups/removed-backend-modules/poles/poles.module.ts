import { Module } from '@nestjs/common';
import { PolesService } from './poles.service.js';
import { PolesController } from './poles.controller.js';

@Module({
  controllers: [PolesController],
  providers: [PolesService],
})
export class PolesModule {}
