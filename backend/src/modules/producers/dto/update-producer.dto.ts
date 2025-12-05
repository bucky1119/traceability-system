import { IsOptional, IsString } from 'class-validator';
import { IsPhoneNumber } from 'class-validator';

export class UpdateProducerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber('CN')
  phone?: string;
}
