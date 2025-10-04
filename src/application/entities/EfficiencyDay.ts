import { DayMeasure } from "./DayMeasure";
import { DayMovement } from "./DayMovement";
import { DayMovementSegment } from "./DayMovementSegment";
import { DaySegment } from "./DaySegment";

export type DayStatus = "draft" | "ready" | "confirmed";

export type EfficiencyDayTotals = {
  minutesByKind: Record<DaySegment["kind"], number>;
  uptimePercentage: number;
  movementsSummary: Record<DayMovement["type"], Partial<Record<DayMovement["tier"], number>>>;
  repairBySystemHours: Record<string, number>;
  totalMinutes: number;
};

export class EfficiencyDay {
  readonly id?: string;
  readonly rigId: string;
  readonly localDate: string;
  readonly status: DayStatus;
  readonly totals?: EfficiencyDayTotals | null;
  readonly confirmedAt?: Date | null;
  readonly confirmedByUserId?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly segments: DaySegment[];
  readonly movements: DayMovement[];
  readonly movementSegments: DayMovementSegment[];
  readonly measures: DayMeasure[];

  constructor(attributes: EfficiencyDay.Attributes) {
    this.id = attributes.id;
    this.rigId = attributes.rigId;
    this.localDate = attributes.localDate;
    this.status = attributes.status ?? "draft";
    this.totals = attributes.totals ?? null;
    this.confirmedAt = attributes.confirmedAt ?? null;
    this.confirmedByUserId = attributes.confirmedByUserId ?? null;
    this.createdAt = attributes.createdAt;
    this.updatedAt = attributes.updatedAt;
    this.segments = attributes.segments ?? [];
    this.movements = attributes.movements ?? [];
    this.movementSegments = attributes.movementSegments ?? [];
    this.measures = attributes.measures ?? [];
  }
}

export namespace EfficiencyDay {
  export type Attributes = {
    id?: string;
    rigId: string;
    localDate: string;
    status?: DayStatus;
    totals?: EfficiencyDayTotals | null;
    confirmedAt?: Date | null;
    confirmedByUserId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    segments?: DaySegment[];
    movements?: DayMovement[];
    movementSegments?: DayMovementSegment[];
    measures?: DayMeasure[];
  };
}
