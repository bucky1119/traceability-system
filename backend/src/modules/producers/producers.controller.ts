import { Controller, Get, Post, Body, Param, UseGuards, Patch, Req } from '@nestjs/common';
import { ProducersService } from './producers.service';
import { CreateProducerDto } from './dto/create-producer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateProducerDto } from './dto/update-producer.dto';

@Controller('producers')
export class ProducersController {
  constructor(private readonly producersService: ProducersService) {}

  @Post('register') // <--- 修改路由
  // @UseGuards(JwtAuthGuard, RolesGuard) <--- 移除守卫
  // @Roles('admin') <--- 移除角色限制
  create(@Body() createProducerDto: CreateProducerDto) {
    return this.producersService.create(createProducerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.producersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.producersService.findOne(+id);
  }

  // 生产者自助修改个人信息（姓名、联系方式）
  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('producer')
  updateMe(@Req() req, @Body() dto: UpdateProducerDto) {
    return this.producersService.updateSelf(req.user.id, dto);
  }
}
