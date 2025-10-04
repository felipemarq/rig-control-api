import { EfficiencyDay } from "@application/entities/EfficiencyDay";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { efficiencyDays } from "../schema";

export type EfficiencyDayRow = InferSelectModel<typeof efficiencyDays>;
export type NewEfficiencyDayRow = InferInsertModel<typeof efficiencyDays>;

export class EfficiencyDayItem {
  static fromRow(row: EfficiencyDayRow): EfficiencyDay {
    return new EfficiencyDay({
      id: row.id,
      rigId: row.rigId,
      localDate: row.localDate,
      status: row.status,
      totals: (row.totals as EfficiencyDay.Totals | null) ?? null,
      confirmedAt: row.confirmedAt ? new Date(row.confirmedAt) : null,
      confirmedByUserId: row.confirmedByUserId ?? null,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    });
  }

  static toRow(entity: EfficiencyDay): NewEfficiencyDayRow {
    return {
      id: entity.id,
      rigId: entity.rigId,
      localDate: entity.localDate,
      status: entity.status,
      totals: entity.totals ?? null,
      confirmedAt: entity.confirmedAt ?? null,
      confirmedByUserId: entity.confirmedByUserId ?? null,
      createdAt: entity.createdAt ?? undefined,
      updatedAt: entity.updatedAt ?? undefined,
    };
  }
}
