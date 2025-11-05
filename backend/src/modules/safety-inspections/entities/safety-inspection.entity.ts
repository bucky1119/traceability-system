import { ProductBatch } from '../../product-batches/entities/product-batch.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('safety_inspections')
export class SafetyInspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'batch_id' })
  batchId: number;

  @Column({ name: 'creator_id' })
  creatorId: number;

  @Column({ name: 'risk_factor_type' })
  riskFactorType: string;

  @Column({ name: 'inspection_time', type: 'datetime' })
  inspectionTime: Date;

  @Column({ name: 'result_image_url', nullable: true })
  result_image_url: string;

  @Column({ name: 'manual_result' })
  manualResult: '合格' | '不合格';

  @Column({ name: 'component_analysis', type: 'text', nullable: true })
  componentAnalysis?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ProductBatch, batch => batch.safetyInspections)
  @JoinColumn({ name: 'batch_id' })
  batch: ProductBatch;
}
