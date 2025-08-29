import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('enterprises')
export class Enterprise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  contacts: string;

  @Column({ type: 'varchar', length: 20 })
  tel: string;

  @Column({ type: 'varchar', length: 50 })
  license: string;

  @Column({ type: 'text' })
  address: string;

  @OneToMany(() => User, (user) => user.enterprise)
  users: User[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 