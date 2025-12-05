import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Producer } from '../../producers/entities/producer.entity';
import { SafetyInspection } from '../../safety-inspections/entities/safety-inspection.entity';
import { QrCode } from '../../qr-codes/entities/qr-code.entity';

@Entity('product_batches')
export class ProductBatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'producer_id' })
  producerId: number;

  @ManyToOne(() => Producer, producer => producer.productBatches)
  @JoinColumn({ name: 'producer_id' })
  producer: Producer;

  @Column({ name: 'vegetable_name' })
  vegetableName: string;

  @Column({ name: 'vegetable_variety', nullable: true })
  vegetableVariety: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column()
  origin: string;

  @Column({ name: 'planting_time', type: 'datetime' })
  plantingTime: Date;

  @Column({ name: 'harvest_time', type: 'datetime' })
  harvestTime: Date;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => SafetyInspection, inspection => inspection.batch)
  safetyInspections: SafetyInspection[];

  @OneToMany(() => QrCode, qrcode => qrcode.batch)
  qrCodes: QrCode[];
}
