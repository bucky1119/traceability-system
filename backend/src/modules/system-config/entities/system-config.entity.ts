import { Entity, PrimaryColumn, Column } from 'typeorm';

// to:
@Entity({ name: 'system_config', synchronize: true })
export class SystemConfig {
  @PrimaryColumn()
  key: string;

  @Column()
  value: string;
}
