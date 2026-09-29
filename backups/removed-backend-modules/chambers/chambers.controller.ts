import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ChambersService } from './chambers.service.js';
import { CreateChamberDto } from './dto/create-chamber.dto.js';
import { UpdateChamberDto } from './dto/update-chamber.dto.js';

@Controller('chambers')
export class ChambersController {
  constructor(private readonly chambersService: ChambersService) {}

  @Post()
  create(@Body() createChamberDto: CreateChamberDto) {
    return this.chambersService.create(createChamberDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.chambersService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chambersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChamberDto: UpdateChamberDto) {
    return this.chambersService.update(id, updateChamberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chambersService.remove(id);
  }
}
