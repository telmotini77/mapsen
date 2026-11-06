import { BoxSlacksService } from './box-slacks.service.js';
import { CreateBoxSlackDto, UpdateBoxSlackDto } from './dto/box-slack.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoxesService } from './boxes.service.js';
import { CreateBoxDto, UpdateBoxDto } from './dto/create-box.dto.js';

@Controller('boxes')
export class BoxesController {
  constructor(private readonly boxesService: BoxesService, private readonly slacks: BoxSlacksService) {}

  @Post()
  create(@Body() createBoxDto: CreateBoxDto) {
    return this.boxesService.create(createBoxDto);
  }

  @Get()
  findAll() {
    return this.boxesService.findAll();
  }

  @Get('slacks')
  mapSlacks() { return this.slacks.map(); }

  @Get(':id/slacks')
  listSlacks(@Param('id') id: string) { return this.slacks.list(id); }

  @Roles('ADMIN', 'OPERATOR')
  @Post(':id/slacks')
  createSlack(@Param('id') id: string, @Body() dto: CreateBoxSlackDto) { return this.slacks.create(id, dto); }

  @Roles('ADMIN', 'OPERATOR')
  @Patch(':id/slacks/:slackId')
  updateSlack(@Param('id') id: string, @Param('slackId') slackId: string, @Body() dto: UpdateBoxSlackDto) { return this.slacks.update(id, slackId, dto); }

  @Roles('ADMIN', 'OPERATOR')
  @Delete(':id/slacks/:slackId')
  removeSlack(@Param('id') id: string, @Param('slackId') slackId: string) { return this.slacks.remove(id, slackId); }

  @Get(':id/table')
  table(@Param('id') id: string) {
    return this.boxesService.table(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boxesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoxDto: UpdateBoxDto) {
    return this.boxesService.update(id, updateBoxDto);
  }

  @Post(':id/ports')
  generatePorts(@Param('id') id: string, @Body() body: { count: number; type?: string }) {
    return this.boxesService.generatePorts(id, body.count, body.type);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boxesService.remove(id);
  }
}
