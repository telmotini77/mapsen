import { Module } from '@nestjs/common';
import { SwitchesService } from './switches.service.js';
import { SwitchesController } from './switches.controller.js';

@Module({
  controllers: [SwitchesController],
  providers: [SwitchesService],
})
export class SwitchesModule {}
