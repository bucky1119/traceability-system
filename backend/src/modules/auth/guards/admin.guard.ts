import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoleType } from '../../roles/entities/role.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    // 检查用户角色是否为管理员
    if (user.role?.type !== RoleType.ADMIN) {
      throw new ForbiddenException('权限不足，需要管理员权限');
    }

    return true;
  }
} 