import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DuctsService } from './ducts.service.js';
import { CreateDuctDto } from './dto/create-duct.dto.js';
import { UpdateDuctDto } from './dto/update-duct.dto.js';

@Controller('ducts')
export class DuctsController {
  constructor(private readonly ductsService: DuctsService) {}

  @Post()
  create(@Body() createDuctDto: CreateDuctDto) {
    return this.ductsService.create(createDuctDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.ductsService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ductsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDuctDto: UpdateDuctDto) {
    return this.ductsService.update(id, updateDuctDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ductsService.remove(id);
  }
}
