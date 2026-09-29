import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PolesService } from './poles.service.js';
import { CreatePoleDto } from './dto/create-pole.dto.js';
import { UpdatePoleDto } from './dto/update-pole.dto.js';

@Controller('poles')
export class PolesController {
  constructor(private readonly polesService: PolesService) {}

  @Post()
  create(@Body() createPoleDto: CreatePoleDto) {
    return this.polesService.create(createPoleDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.polesService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.polesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePoleDto: UpdatePoleDto) {
    return this.polesService.update(id, updatePoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.polesService.remove(id);
  }
}
