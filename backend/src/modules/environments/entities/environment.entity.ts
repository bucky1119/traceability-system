import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Batch } from '../../batches/entities/batch.entity';

@Entity('environments')
export class Environment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'batch_id' })
  batchId: number;

  @Column({ name: 'record_time', type: 'timestamp' })
  recordTime: Date;

  @Column({ type: 'float' })
  temperature: number;

  @Column({ type: 'float' })
  humidity: number;

  @Column({ type: 'int' })
  light: number;

  @Column({ type: 'float' })
  co2: number;

  @Column({ name: 'soil_ph', type: 'float' })
  soilPh: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Batch, (batch) => batch.environments)
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 