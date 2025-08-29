import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Batch } from '../../batches/entities/batch.entity';
import { User } from '../../users/entities/user.entity';

export enum ActionType {
  PLANTING = 'planting',
  FERTILIZING = 'fertilizing',
  WATERING = 'watering',
  WEEDING = 'weeding',
  PEST_CONTROL = 'pest_control',
  HARVESTING = 'harvesting',
  OTHER = 'other',
}

@Entity('actions')
export class Action {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'batch_id' })
  batchId: number;

  @Column({ name: 'action_type', type: 'varchar', length: 100 })
  actionType: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'image_url', type: 'varchar', length: 200, nullable: true })
  imageUrl: string;

  @Column({ name: 'operator_id' })
  operatorId: number;

  @Column({ name: 'record_time', type: 'timestamp' })
  recordTime: Date;

  @ManyToOne(() => Batch, (batch) => batch.actions)
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @ManyToOne(() => User, (user) => user.actions)
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 