import { DayMovementSegment } from "@application/entities/DayMovementSegment";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { dayMovementSegments } from "../schema";

export type DayMovementSegmentRow = InferSelectModel<typeof dayMovementSegments>;
export type NewDayMovementSegmentRow = InferInsertModel<typeof dayMovementSegments>;

export class DayMovementSegmentItem {
  static fromRow(row: DayMovementSegmentRow): DayMovementSegment {
    return new DayMovementSegment({
      dayMovementId: row.dayMovementId,
      daySegmentId: row.daySegmentId,
    });
  }

  static toRow(entity: DayMovementSegment): NewDayMovementSegmentRow {
    return {
      dayMovementId: entity.dayMovementId,
      daySegmentId: entity.daySegmentId,
    };
  }
}
