// infra/db/items/UserRigAccessItem.ts
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { userRigAccess } from "../schema"; // ajuste o path
import { UserRigAccess } from "@application/entities/UserRigAcess";

export type UserRigAccessRow = InferSelectModel<typeof userRigAccess>;
export type NewUserRigAccessRow = InferInsertModel<typeof userRigAccess>;

export class UserRigAccessItem {
  static fromRow(row: UserRigAccessRow): UserRigAccess {
    return new UserRigAccess({
      userId: row.userId,
      rigId: row.rigId,
      level: row.level as UserRigAccess["level"],
      assignedByUserId: row.assignedByUserId ?? null,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    });
  }

  static toRow(entity: UserRigAccess): NewUserRigAccessRow {
    return {
      userId: entity.userId,
      rigId: entity.rigId,
      level: entity.level,
      assignedByUserId: entity.assignedByUserId ?? null,
      createdAt: entity.createdAt ?? undefined,
      updatedAt: entity.updatedAt ?? undefined,
    };
  }
}
