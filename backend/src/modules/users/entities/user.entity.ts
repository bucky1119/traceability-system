import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Enterprise } from '../../enterprises/entities/enterprise.entity';
import { Product } from '../../products/entities/product.entity';
import { Action } from '../../actions/entities/action.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 200 })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  tel: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'enterprise_id', nullable: true })
  enterpriseId: number;

  @Column({ name: 'create_time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Enterprise, (enterprise) => enterprise.users)
  @JoinColumn({ name: 'enterprise_id' })
  enterprise: Enterprise;

  @OneToMany(() => Product, (product) => product.producer)
  products: Product[];

  @OneToMany(() => Action, (action) => action.operator)
  actions: Action[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 