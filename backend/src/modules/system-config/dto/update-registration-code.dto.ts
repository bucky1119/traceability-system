import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateRegistrationCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
