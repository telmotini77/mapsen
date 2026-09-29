import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PopsService } from './pops.service.js';
import { CreatePopDto } from './dto/create-pop.dto.js';
import { UpdatePopDto } from './dto/update-pop.dto.js';

@Controller('pops')
export class PopsController {
  constructor(private readonly popsService: PopsService) {}

  @Post()
  create(@Body() createPopDto: CreatePopDto) {
    return this.popsService.create(createPopDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.popsService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.popsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePopDto: UpdatePopDto) {
    return this.popsService.update(id, updatePopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.popsService.remove(id);
  }
}
