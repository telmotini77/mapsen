import { Module } from '@nestjs/common';
import { PopsService } from './pops.service.js';
import { PopsController } from './pops.controller.js';

@Module({
  controllers: [PopsController],
  providers: [PopsService],
})
export class PopsModule {}
