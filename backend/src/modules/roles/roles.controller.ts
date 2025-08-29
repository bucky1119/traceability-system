import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@ApiTags('角色管理')
@Controller('roles')
export class RolesController {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  @ApiResponse({ status: 200, description: '获取角色列表成功' })
  async findAll() {
    const roles = await this.roleRepository.find({
      select: ['id', 'name', 'description', 'type']
    });
    
    return roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      type: role.type,
      label: role.name // 为前端提供label字段
    }));
  }
} 