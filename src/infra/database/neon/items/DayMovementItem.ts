import { DayMovement } from "@application/entities/DayMovement";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { dayMovements } from "../schema";

export type DayMovementRow = InferSelectModel<typeof dayMovements>;
export type NewDayMovementRow = InferInsertModel<typeof dayMovements>;

export class DayMovementItem {
  static fromRow(row: DayMovementRow): DayMovement {
    return new DayMovement({
      id: row.id,
      dayId: row.dayId,
      type: row.type as DayMovement["type"],
      distanceKm: Number(row.distanceKm),
      tier: row.tier as DayMovement["tier"],
      startedAt: row.startedAt ? new Date(row.startedAt) : null,
      endedAt: row.endedAt ? new Date(row.endedAt) : null,
      notes: row.notes ?? null,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
    });
  }

  static toRow(entity: DayMovement): NewDayMovementRow {
    if (!entity.dayId) {
      throw new Error("DayMovement must have a dayId before persistence");
    }

    return {
      id: entity.id,
      dayId: entity.dayId,
      type: entity.type,
      distanceKm: entity.distanceKm.toString(),
      tier: entity.tier,
      startedAt: entity.startedAt ?? null,
      endedAt: entity.endedAt ?? null,
      notes: entity.notes ?? null,
      createdAt: entity.createdAt ?? undefined,
    };
  }
}
