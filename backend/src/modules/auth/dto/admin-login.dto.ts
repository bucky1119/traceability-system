import { IsString, IsNotEmpty } from 'class-validator';

// DTO 专用于管理员登录（username/password）
export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
