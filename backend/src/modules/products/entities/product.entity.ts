import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Batch } from '../../batches/entities/batch.entity';
import { Qrcode } from '../../qrcodes/entities/qrcode.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'image_url', type: 'varchar', length: 200, nullable: true })
  imageUrl: string;

  @Column({ name: 'producer_id' })
  producerId: number;

  @Column({ type: 'varchar', length: 200 })
  origin: string;

  @Column({ name: 'planting_date', type: 'date' })
  plantingDate: Date;

  @Column({ name: 'harvest_date', type: 'date', nullable: true })
  harvestDate: Date;

  @Column({ name: 'test_type', type: 'varchar', length: 100, nullable: true })
  testType: string;

  @Column({ name: 'test_date', type: 'date', nullable: true })
  testDate: Date;

  @Column({ name: 'test_report', type: 'varchar', length: 200, nullable: true })
  testReport: string;

  @Column({ name: 'is_qualified', type: 'boolean', default: false })
  isQualified: boolean;

  // 新增字段：安全风险因子检测
  @Column({ name: 'safety_risk_test', type: 'varchar', length: 500, nullable: true })
  safetyRiskTest: string;

  // 新增字段：产品成分检测
  @Column({ name: 'ingredient_test', type: 'varchar', length: 500, nullable: true })
  ingredientTest: string;

  // 新增字段：录入者ID（管理员录入时使用）
  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  // 生产者快照字段，便于前端直接展示
  @Column({ name: 'producer_name', type: 'varchar', length: 100, nullable: true })
  producerName: string;

  @Column({ name: 'producer_tel', type: 'varchar', length: 20, nullable: true })
  producerTel: string;

  @Column({ name: 'producer_enterprise', type: 'varchar', length: 100, nullable: true })
  producerEnterprise: string;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'producer_id' })
  producer: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @OneToMany(() => Batch, (batch) => batch.product)
  batches: Batch[];

  @OneToMany(() => Qrcode, (qrcode) => qrcode.product)
  qrcodes: Qrcode[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 