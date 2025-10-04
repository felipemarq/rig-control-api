import { DaySegment } from "@application/entities/DaySegment";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { daySegments } from "../schema";

export type DaySegmentRow = InferSelectModel<typeof daySegments>;
export type NewDaySegmentRow = InferInsertModel<typeof daySegments>;

export class DaySegmentItem {
  static fromRow(row: DaySegmentRow): DaySegment {
    return new DaySegment({
      id: row.id,
      dayId: row.dayId,
      kind: row.kind as DaySegment["kind"],
      subtype: row.subtype ?? null,
      startsAt: new Date(row.startsAt),
      endsAt: new Date(row.endsAt),
      wellId: row.wellId ?? null,
      repairSystemId: row.repairSystemId ?? null,
      repairPartId: row.repairPartId ?? null,
      notes: row.notes ?? null,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    });
  }

  static toRow(entity: DaySegment): NewDaySegmentRow {
    if (!entity.dayId) {
      throw new Error("DaySegment must have a dayId before persistence");
    }

    return {
      id: entity.id,
      dayId: entity.dayId,
      kind: entity.kind,
      subtype: entity.subtype ?? null,
      startsAt: entity.startsAt,
      endsAt: entity.endsAt,
      wellId: entity.wellId ?? null,
      repairSystemId: entity.repairSystemId ?? null,
      repairPartId: entity.repairPartId ?? null,
      notes: entity.notes ?? null,
      createdAt: entity.createdAt ?? undefined,
      updatedAt: entity.updatedAt ?? undefined,
    };
  }
}
