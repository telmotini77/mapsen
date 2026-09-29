import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SwitchesService } from './switches.service.js';
import { CreateSwitchDto } from './dto/create-switch.dto.js';
import { UpdateSwitchDto } from './dto/update-switch.dto.js';

@Controller('switches')
export class SwitchesController {
  constructor(private readonly switchesService: SwitchesService) {}

  @Post()
  create(@Body() createSwitchDto: CreateSwitchDto) {
    return this.switchesService.create(createSwitchDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.switchesService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.switchesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSwitchDto: UpdateSwitchDto) {
    return this.switchesService.update(id, updateSwitchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.switchesService.remove(id);
  }
}
