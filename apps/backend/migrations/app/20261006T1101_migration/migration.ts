#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5b589f4a2823c996da0b77ca64efe541fedee519a1b2450171336c2a169b0159/contract';
import endContract from '../../snapshots/5b589f4a2823c996da0b77ca64efe541fedee519a1b2450171336c2a169b0159/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/91e7f9f035806fa2789a4d726ef7724cad434fd6b00014d47ebf12d6e6bb784e/contract';
import startContract from '../../snapshots/91e7f9f035806fa2789a4d726ef7724cad434fd6b00014d47ebf12d6e6bb784e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.dropTable({ schema: 'public', table: 'Post' })];
  }
}

MigrationCLI.run(import.meta.url, M);
