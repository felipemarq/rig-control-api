// infra/db/items/ClientItem.ts
import { Client } from "@application/entities/Client";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { clients as clientsTable } from "../schema";
// <- ajuste o path

export type ClientRow = InferSelectModel<typeof clientsTable>;
export type NewClientRow = InferInsertModel<typeof clientsTable>;

/**
 * Mapper entre a entidade de domínio e a linha do banco (DB <-> Domain)
 */
export class ClientItem {
  /** DB -> Entidade */
  static fromRow(row: ClientRow): Client {
    return new Client({
      id: row.id,
      name: row.name,
      taxId: row.taxId ?? undefined,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
      deletedAt: row.deletedAt ? new Date(row.deletedAt) : null,
    });
  }

  /** Entidade -> Row para insert/update */
  static toRow(entity: Client): NewClientRow {
    return {
      id: entity.id,
      name: entity.name,
      taxId: entity.taxId ?? null,
      createdAt: entity.createdAt ?? undefined,
      updatedAt: entity.updatedAt ?? undefined,
      deletedAt: entity.deletedAt ?? null,
    };
  }
}
