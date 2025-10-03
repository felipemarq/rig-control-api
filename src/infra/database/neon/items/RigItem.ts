// infra/db/items/RigItem.ts
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { rigs as rigsTable } from "../schema"; // ajuste o path
import { Rig } from "@application/entities/Rig";

// Tipos baseados no schema Drizzle
export type RigRow = InferSelectModel<typeof rigsTable>;
export type NewRigRow = InferInsertModel<typeof rigsTable>;

/**
 * Mapper entre a entidade de domínio e a linha do banco (DB <-> Domain)
 */
export class RigItem {
  /** DB -> Entidade */
  static fromRow(row: RigRow): Rig {
    return new Rig({
      id: row.id,
      name: row.name,
      clientId: row.clientId ?? null,
      contractId: row.contractId ?? null,
      baseId: row.baseId ?? null,
      uf: row.uf as Rig["uf"],
      timezone: row.timezone ?? "America/Bahia",
      isActive: row.isActive,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    });
  }

  /** Entidade -> Row (insert/update) */
  static toRow(entity: Rig): NewRigRow {
    return {
      id: entity.id,
      name: entity.name,
      clientId: entity.clientId ?? null,
      contractId: entity.contractId ?? null,
      baseId: entity.baseId ?? null,
      uf: entity.uf,
      timezone: entity.timezone ?? "America/Bahia",
      isActive: entity.isActive ?? true,
      createdAt: entity.createdAt ?? undefined,
      updatedAt: entity.updatedAt ?? undefined,
    };
  }
}
