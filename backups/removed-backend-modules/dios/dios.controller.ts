import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DiosService } from './dios.service.js';
import { CreateDioDto } from './dto/create-dio.dto.js';
import { UpdateDioDto } from './dto/update-dio.dto.js';

@Controller('dios')
export class DiosController {
  constructor(private readonly diosService: DiosService) {}

  @Post()
  create(@Body() createDioDto: CreateDioDto) {
    return this.diosService.create(createDioDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.diosService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDioDto: UpdateDioDto) {
    return this.diosService.update(id, updateDioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diosService.remove(id);
  }
}
