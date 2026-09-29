import { Test, TestingModule } from '@nestjs/testing';
import { NetworkNodesService } from './network-nodes.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('NetworkNodesService', () => {
  let service: NetworkNodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NetworkNodesService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<NetworkNodesService>(NetworkNodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
