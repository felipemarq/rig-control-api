import { EfficiencyDay } from "@application/entities/EfficiencyDay";
import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { efficiencyDays } from "../schema";
import { EfficiencyDayItem } from "../items/EfficiencyDayItem";

@Injectable()
export class EfficiencyDayRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async upsert(day: EfficiencyDay): Promise<EfficiencyDay> {
    const row = EfficiencyDayItem.toRow(day);

    const upsertedRow = await this.databaseService.transaction(async (tx) => {
      const [result] = await tx
        .insert(efficiencyDays)
        .values({
          id: row.id ?? undefined,
          rigId: row.rigId,
          localDate: row.localDate,
          status: row.status,
          totals: row.totals ?? null,
          confirmedAt: row.confirmedAt ?? null,
          confirmedByUserId: row.confirmedByUserId ?? null,
          createdAt: row.createdAt ?? undefined,
          updatedAt: row.updatedAt ?? undefined,
        })
        .onConflictDoUpdate({
          target: [efficiencyDays.rigId, efficiencyDays.localDate],
          set: {
            status: row.status,
            totals: row.totals ?? null,
            confirmedAt: row.confirmedAt ?? null,
            confirmedByUserId: row.confirmedByUserId ?? null,
            updatedAt: new Date(),
          },
        })
        .returning();

      return result;
    });

    return EfficiencyDayItem.fromRow(upsertedRow);
  }
}
