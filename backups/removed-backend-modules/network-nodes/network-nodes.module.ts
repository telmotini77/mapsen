import { Module } from '@nestjs/common';
import { NetworkNodesController } from './network-nodes.controller.js';
import { NetworkNodesService } from './network-nodes.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [NetworkNodesController],
  providers: [NetworkNodesService]
})
export class NetworkNodesModule {}
