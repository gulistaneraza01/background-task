#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5d4b55c275488fb6fd24975156060b6778a11fc6aee230c99784337f3e1f0749/contract';
import endContract from '../../snapshots/5d4b55c275488fb6fd24975156060b6778a11fc6aee230c99784337f3e1f0749/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f7308a9714b03bcd652922b4886b7627a254cc5ab94b4fa837ba6ac753339c80/contract';
import startContract from '../../snapshots/f7308a9714b03bcd652922b4886b7627a254cc5ab94b4fa837ba6ac753339c80/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Image',
        columns: [
          col('contentType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('error', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('height', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('width', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ImageVariant',
        columns: [
          col('height', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('imageId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('label', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('size', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('width', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Image',
        constraint: 'Image_key_key',
        columns: ['key'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ImageVariant',
        constraint: 'ImageVariant_imageId_label_key',
        columns: ['imageId', 'label'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ImageVariant',
        index: 'ImageVariant_imageId_idx_9d3c09ba',
        columns: ['imageId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ImageVariant',
        foreignKey: {
          name: 'ImageVariant_imageId_fkey',
          columns: ['imageId'],
          references: { schema: 'public', table: 'Image', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
