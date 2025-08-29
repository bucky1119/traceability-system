import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Environment } from '../../environments/entities/environment.entity';
import { Action } from '../../actions/entities/action.entity';
import { Qrcode } from '../../qrcodes/entities/qrcode.entity';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'batch_code', type: 'varchar', length: 100, unique: true })
  batchCode: string;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'create_time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Product, (product) => product.batches)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => Environment, (environment) => environment.batch)
  environments: Environment[];

  @OneToMany(() => Action, (action) => action.batch)
  actions: Action[];

  @OneToMany(() => Qrcode, (qrcode) => qrcode.batch)
  qrcodes: Qrcode[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 