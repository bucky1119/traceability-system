import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductBatch } from '../../product-batches/entities/product-batch.entity';

@Entity('qr_codes')
export class QrCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'batch_id' })
  batchId: number;

  // QR 码图片如需落盘可单独存储，此处不映射该列以与SQL保持一致

  @ManyToOne(() => ProductBatch, batch => batch.qrCodes)
  @JoinColumn({ name: 'batch_id' })
  batch: ProductBatch;

  @Column({ name: 'code_data', unique: true })
  codeData: string;

  @Column({ name: 'access_url' })
  accessUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
