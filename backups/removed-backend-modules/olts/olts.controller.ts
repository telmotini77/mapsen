import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OltsService } from './olts.service.js';
import { CreateOltDto, UpdateOltDto } from './dto/create-olt.dto.js';

@Controller('olts')
export class OltsController {
  constructor(private readonly oltsService: OltsService) {}

  @Post() create(@Body() dto: CreateOltDto) { return this.oltsService.create(dto); }
  @Get() findAll() { return this.oltsService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.oltsService.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateOltDto) { return this.oltsService.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.oltsService.remove(id); }
}
