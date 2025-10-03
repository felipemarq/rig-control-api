// infra/db/items/ContractItem.ts
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { contracts as contractsTable } from "../schema"; // ajuste o path
import { Contract } from "@application/entities/Contract";

export type ContractRow = InferSelectModel<typeof contractsTable>;
export type NewContractRow = InferInsertModel<typeof contractsTable>;

/**
 * Mapper entre a entidade de domínio e a linha do banco (DB <-> Domain)
 */
export class ContractItem {
  /** DB -> Entidade */
  static fromRow(row: ContractRow): Contract {
    return new Contract({
      id: row.id,
      clientId: row.clientId,
      code: row.code,
      status: row.status as Contract["status"], // enum do DB -> union type
      startAt: row.startAt ? new Date(row.startAt) : new Date(), // Drizzle já costuma entregar Date, garantimos
      endAt: row.endAt ? new Date(row.endAt) : null,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    });
  }

  /** Entidade -> Row (insert/update) */
  static toRow(entity: Contract): NewContractRow {
    console.log(entity);
    console.log({
      id: entity.id,
      clientId: entity.clientId,
      code: entity.code,
      status: entity.status,
      startAt: entity.startAt.toISOString(),
      endAt: entity.endAt?.toISOString() ?? null,
      createdAt: entity.createdAt ?? undefined,
      updatedAt: entity.updatedAt ?? undefined,
    });
    return {
      id: entity.id,
      clientId: entity.clientId,
      code: entity.code,
      status: entity.status,
      startAt: entity.startAt.toISOString(),
      endAt: entity.endAt?.toISOString() ?? null,
      createdAt: entity.createdAt ?? undefined,
      updatedAt: entity.updatedAt ?? undefined,
    };
  }
}
