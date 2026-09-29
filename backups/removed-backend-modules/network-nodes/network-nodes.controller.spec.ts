import { Test, TestingModule } from '@nestjs/testing';
import { NetworkNodesController } from './network-nodes.controller.js';
import { NetworkNodesService } from './network-nodes.service.js';

describe('NetworkNodesController', () => {
  let controller: NetworkNodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NetworkNodesController],
      providers: [{ provide: NetworkNodesService, useValue: {} }],
    }).compile();

    controller = module.get<NetworkNodesController>(NetworkNodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
