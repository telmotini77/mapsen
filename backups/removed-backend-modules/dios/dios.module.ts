import { Module } from '@nestjs/common';
import { DiosService } from './dios.service.js';
import { DiosController } from './dios.controller.js';

@Module({
  controllers: [DiosController],
  providers: [DiosService],
})
export class DiosModule {}
