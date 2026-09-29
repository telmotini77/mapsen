import { Module } from '@nestjs/common';
import { DuctsService } from './ducts.service.js';
import { DuctsController } from './ducts.controller.js';

@Module({
  controllers: [DuctsController],
  providers: [DuctsService],
})
export class DuctsModule {}
