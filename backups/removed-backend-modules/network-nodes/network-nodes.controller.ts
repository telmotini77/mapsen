import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NetworkNodesService } from './network-nodes.service.js';

@Controller('api/v1/nodes')
export class NetworkNodesController {
  constructor(private readonly networkNodesService: NetworkNodesService) {}

  @Post()
  create(@Body() createNodeDto: any) {
    return this.networkNodesService.create(createNodeDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.networkNodesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.networkNodesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNodeDto: any) {
    return this.networkNodesService.update(id, updateNodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.networkNodesService.remove(id);
  }
}
