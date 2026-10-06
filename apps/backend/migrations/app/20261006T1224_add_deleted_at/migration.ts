#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/5b589f4a2823c996da0b77ca64efe541fedee519a1b2450171336c2a169b0159/contract';
import startContract from '../../snapshots/5b589f4a2823c996da0b77ca64efe541fedee519a1b2450171336c2a169b0159/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f7308a9714b03bcd652922b4886b7627a254cc5ab94b4fa837ba6ac753339c80/contract';
import endContract from '../../snapshots/f7308a9714b03bcd652922b4886b7627a254cc5ab94b4fa837ba6ac753339c80/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('deletedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
