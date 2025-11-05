import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entities/system-config.entity';

const REGISTRATION_CODE_KEY = 'REGISTRATION_CODE';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
  ) {}

  async setRegistrationCode(code: string): Promise<SystemConfig> {
    let config = await this.systemConfigRepository.findOne({ where: { key: REGISTRATION_CODE_KEY } });
    if (config) {
      config.value = code;
    } else {
      config = this.systemConfigRepository.create({ key: REGISTRATION_CODE_KEY, value: code });
    }
    return this.systemConfigRepository.save(config);
  }

  async getRegistrationCode(): Promise<string | null> {
    const config = await this.systemConfigRepository.findOne({ where: { key: REGISTRATION_CODE_KEY } });
    return config ? config.value : null;
  }
}
