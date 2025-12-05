import { IsString, IsNotEmpty, IsPhoneNumber, MinLength, IsOptional } from 'class-validator';

export class CreateProducerDto {
  @IsString()
  @IsNotEmpty()
  account: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsPhoneNumber('CN')
  @IsOptional()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  registrationCode: string;
}
