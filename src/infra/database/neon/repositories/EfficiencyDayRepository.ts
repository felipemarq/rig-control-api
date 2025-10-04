import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { SQL, and, asc, desc, eq, gte, lte, inArray, sql } from "drizzle-orm";
import {
  dayMeasures,
  dayMovements,
  daySegments,
  efficiencyDays,
} from "../schema";
import { EfficiencyDay, DayStatus } from "@application/entities/EfficiencyDay";
import { DaySegment } from "@application/entities/DaySegment";
import { DayMovement } from "@application/entities/DayMovement";
import { DayMeasure } from "@application/entities/DayMeasure";
import { EfficiencyDayItem } from "../items/EfficiencyDayItem";
import { DaySegmentItem } from "../items/DaySegmentItem";
import { DayMovementItem } from "../items/DayMovementItem";
import { DayMeasureItem } from "../items/DayMeasureItem";
import { dayMovementSegments } from "../schema";
import { DayMovementSegmentItem } from "../items/DayMovementSegmentItem";
import { ListEfficiencyDayQuery } from "@application/controllers/efficiencyDays/schemas/listEfficiencyDayQuerySchema";
import { EfficiencyDayRow } from "../items/EfficiencyDayItem";

export type EfficiencyDayDetailed = EfficiencyDay;

@Injectable()
export class EfficiencyDayRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async upsert(day: EfficiencyDay): Promise<EfficiencyDayDetailed> {
    const dayId = await this.databaseService.db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(efficiencyDays)
        .where(
          and(
            eq(efficiencyDays.rigId, day.rigId),
            eq(efficiencyDays.localDate, day.localDate)
          )
        )
        .limit(1);

      const row = EfficiencyDayItem.toRow(day);
      let currentId: string;

      if (existing.length) {
        const [updated] = await tx
          .update(efficiencyDays)
          .set({
            status: row.status,
            totals: row.totals,
            confirmedAt: row.confirmedAt ?? null,
            confirmedByUserId: row.confirmedByUserId ?? null,
            updatedAt: new Date(),
          })
          .where(eq(efficiencyDays.id, existing[0].id))
          .returning({ id: efficiencyDays.id });

        currentId = updated.id;
      } else {
        const [created] = await tx
          .insert(efficiencyDays)
          .values({
            ...row,
            createdAt: row.createdAt ?? new Date(),
            updatedAt: row.updatedAt ?? new Date(),
          })
          .returning({ id: efficiencyDays.id });

        currentId = created.id;
      }

      await tx.delete(dayMovements).where(eq(dayMovements.dayId, currentId));
      await tx.delete(daySegments).where(eq(daySegments.dayId, currentId));
      await tx.delete(dayMeasures).where(eq(dayMeasures.dayId, currentId));

      if (day.segments.length) {
        await tx.insert(daySegments).values(
          day.segments.map((segment) =>
            DaySegmentItem.toRow(new DaySegment({ ...segment, dayId: currentId }))
          )
        );
      }

      if (day.movements.length) {
        await tx.insert(dayMovements).values(
          day.movements.map((movement) =>
            DayMovementItem.toRow(new DayMovement({ ...movement, dayId: currentId }))
          )
        );
      }

      if (day.measures.length) {
        await tx.insert(dayMeasures).values(
          day.measures.map((measure) =>
            DayMeasureItem.toRow(new DayMeasure({ ...measure, dayId: currentId }))
          )
        );
      }

      if (day.movementSegments.length) {
        await tx.insert(dayMovementSegments).values(
          day.movementSegments.map((movementSegment) =>
            DayMovementSegmentItem.toRow(movementSegment)
          )
        );
      }

      return currentId;
    });

    const updated = await this.findById(dayId);
    if (!updated) {
      throw new Error("Failed to load efficiency day after upsert");
    }

    return updated;
  }

  async updateStatus(
    dayId: string,
    status: DayStatus,
    confirmedByUserId?: string | null
  ): Promise<EfficiencyDayDetailed | null> {
    const confirmedAt = status === "confirmed" ? new Date() : null;

    await this.databaseService.db
      .update(efficiencyDays)
      .set({
        status,
        confirmedAt,
        confirmedByUserId: confirmedByUserId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(efficiencyDays.id, dayId));

    return this.findById(dayId);
  }

  async delete(dayId: string): Promise<boolean> {
    const [deleted] = await this.databaseService.db
      .delete(efficiencyDays)
      .where(eq(efficiencyDays.id, dayId))
      .returning({ id: efficiencyDays.id });

    return Boolean(deleted);
  }

  async findById(dayId: string): Promise<EfficiencyDayDetailed | null> {
    const [row] = await this.databaseService.db
      .select()
      .from(efficiencyDays)
      .where(eq(efficiencyDays.id, dayId))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.hydrate(row);
  }

  async findByRigAndDate(
    rigId: string,
    localDate: string
  ): Promise<EfficiencyDayDetailed | null> {
    const [row] = await this.databaseService.db
      .select()
      .from(efficiencyDays)
      .where(
        and(
          eq(efficiencyDays.rigId, rigId),
          eq(efficiencyDays.localDate, localDate)
        )
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return this.hydrate(row);
  }

  async list(
    filters: ListEfficiencyDayQuery
  ): Promise<{
    items: EfficiencyDay[];
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
  }> {
    const limit = Math.min(Math.max(Number(filters.pageSize ?? "10"), 1), 100);
    const page = Math.max(Number(filters.page ?? "1"), 1);
    const offset = (page - 1) * limit;

    const where: SQL<unknown>[] = [];

    if (filters.rigId) {
      where.push(eq(efficiencyDays.rigId, filters.rigId));
    }

    if (filters.status) {
      where.push(eq(efficiencyDays.status, filters.status));
    }

    if (filters.localDateGte) {
      where.push(gte(efficiencyDays.localDate, filters.localDateGte));
    }

    if (filters.localDateLte) {
      where.push(lte(efficiencyDays.localDate, filters.localDateLte));
    }

    const whereExpr = where.length ? and(...where) : undefined;

    const totalQuery = this.databaseService.db
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(efficiencyDays);

    const [{ total }] = await (whereExpr
      ? totalQuery.where(whereExpr)
      : totalQuery);

    const rowsQuery = this.databaseService.db
      .select()
      .from(efficiencyDays)
      .orderBy(
        filters.sortDir === "asc"
          ? asc(efficiencyDays.localDate)
          : desc(efficiencyDays.localDate)
      )
      .limit(limit)
      .offset(offset);

    const rows = await (whereExpr ? rowsQuery.where(whereExpr) : rowsQuery);

    const items = rows.map((row) => EfficiencyDayItem.fromRow(row));

    return {
      items,
      total,
      page,
      pageSize: limit,
      hasNext: page * limit < total,
    };
  }

  private async hydrate(row: EfficiencyDayRow): Promise<EfficiencyDayDetailed> {
    const segments = await this.databaseService.db
      .select()
      .from(daySegments)
      .where(eq(daySegments.dayId, row.id));

    const segmentEntities = segments.map(DaySegmentItem.fromRow);

    const movements = await this.databaseService.db
      .select()
      .from(dayMovements)
      .where(eq(dayMovements.dayId, row.id));

    const movementEntities = movements.map(DayMovementItem.fromRow);

    const movementIds = movementEntities
      .map((movement) => movement.id)
      .filter((id): id is string => Boolean(id));

    const movementSegmentsRows = movementIds.length
      ? await this.databaseService.db
          .select()
          .from(dayMovementSegments)
          .where(inArray(dayMovementSegments.dayMovementId, movementIds))
      : [];

    const measures = await this.databaseService.db
      .select()
      .from(dayMeasures)
      .where(eq(dayMeasures.dayId, row.id));

    const measureEntities = measures.map(DayMeasureItem.fromRow);

    return EfficiencyDayItem.fromRow(row, {
      segments: segmentEntities,
      movements: movementEntities,
      movementSegments: movementSegmentsRows.map(
        DayMovementSegmentItem.fromRow
      ),
      measures: measureEntities,
    });
  }
}
