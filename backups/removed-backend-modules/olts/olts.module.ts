import { Module } from '@nestjs/common';
import { OltsService } from './olts.service.js';
import { OltsController } from './olts.controller.js';

@Module({
  controllers: [OltsController],
  providers: [OltsService],
})
export class OltsModule {}
