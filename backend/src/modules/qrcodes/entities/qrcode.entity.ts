import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Batch } from '../../batches/entities/batch.entity';
import { Product } from '../../products/entities/product.entity';

export enum QrcodeStatus {
  UNBOUND = 0,
  ACTIVE = 1,
  EXPIRED = 2,
  DISABLED = 3,
}

@Entity('qrcodes')
export class Qrcode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'qrcode_id', type: 'varchar', length: 100, unique: true })
  qrcodeId: string;

  @Column({ name: 'batch_id' })
  batchId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'longtext' })
  link: string;

  @Column({ name: 'qrcode_data_url', type: 'longtext', nullable: true })
  qrcodeDataUrl: string;

  // 新增：二维码图片存储相关字段
  @Column({ name: 'qrcode_image_url', type: 'varchar', length: 500, nullable: true })
  qrcodeImageUrl: string;

  @Column({ name: 'qrcode_image_path', type: 'varchar', length: 500, nullable: true })
  qrcodeImagePath: string;

  @Column({ name: 'qrcode_image_size', type: 'int', nullable: true })
  qrcodeImageSize: number;

  @Column({ name: 'generate_time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generateTime: Date;

  @Column({ name: 'scan_count', type: 'int', default: 0 })
  scanCount: number;

  @Column({ name: 'last_scan_time', type: 'timestamp', nullable: true })
  lastScanTime: Date;

  @Column({ type: 'tinyint', default: QrcodeStatus.UNBOUND })
  status: QrcodeStatus;

  @Column({ name: 'expire_time', type: 'timestamp', nullable: true })
  expireTime: Date;

  @ManyToOne(() => Batch, (batch) => batch.qrcodes)
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @ManyToOne(() => Product, (product) => product.qrcodes)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 