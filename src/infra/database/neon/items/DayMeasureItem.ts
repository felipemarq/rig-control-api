import { DayMeasure } from "@application/entities/DayMeasure";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { dayMeasures } from "../schema";

export type DayMeasureRow = InferSelectModel<typeof dayMeasures>;
export type NewDayMeasureRow = InferInsertModel<typeof dayMeasures>;

export class DayMeasureItem {
  static fromRow(row: DayMeasureRow): DayMeasure {
    return new DayMeasure({
      id: row.id,
      dayId: row.dayId,
      key: row.key,
      unit: row.unit,
      value: Number(row.value),
      meta: (row.meta as Record<string, unknown> | null) ?? null,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
    });
  }

  static toRow(entity: DayMeasure): NewDayMeasureRow {
    if (!entity.dayId) {
      throw new Error("DayMeasure must have a dayId before persistence");
    }

    return {
      id: entity.id,
      dayId: entity.dayId,
      key: entity.key,
      unit: entity.unit,
      value: entity.value.toString(),
      meta: entity.meta ?? null,
      createdAt: entity.createdAt ?? undefined,
    };
  }
}
