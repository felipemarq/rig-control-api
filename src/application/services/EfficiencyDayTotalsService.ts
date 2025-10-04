import { Injectable } from "@kernel/decorators/Injectable";
import { DayMovement, DistanceTier } from "@application/entities/DayMovement";
import { DaySegment, SegmentKind } from "@application/entities/DaySegment";
import { EfficiencyDayTotals } from "@application/entities/EfficiencyDay";

const SEGMENT_KINDS: SegmentKind[] = [
  "OPERATING",
  "DTM",
  "GLOSA",
  "REPAIR",
  "OTHER",
];

const MOVEMENT_TYPES: DayMovement["type"][] = [
  "EQUIPMENTS",
  "FLUIDS",
  "TUBES",
];

@Injectable()
export class EfficiencyDayTotalsService {
  calculate({
    segments,
    movements,
  }: EfficiencyDayTotalsService.Input): EfficiencyDayTotals {
    const minutesByKind = SEGMENT_KINDS.reduce(
      (acc, kind) => ({ ...acc, [kind]: 0 }),
      {} as Record<SegmentKind, number>
    );

    const repairBySystemHours: Record<string, number> = {};

    let totalMinutes = 0;

    for (const segment of segments) {
      const minutes = this.diffMinutes(segment.startsAt, segment.endsAt);
      totalMinutes += minutes;
      minutesByKind[segment.kind] += minutes;

      if (segment.kind === "REPAIR" && segment.repairSystemId) {
        const hours = minutes / 60;
        repairBySystemHours[segment.repairSystemId] =
          (repairBySystemHours[segment.repairSystemId] ?? 0) + hours;
      }
    }

    const movementsSummary = MOVEMENT_TYPES.reduce(
      (acc, type) => ({ ...acc, [type]: {} as Record<DistanceTier, number> }),
      {} as Record<DayMovement["type"], Record<DistanceTier, number>>
    );

    for (const movement of movements) {
      const typeSummary = movementsSummary[movement.type];
      typeSummary[movement.tier] = (typeSummary[movement.tier] ?? 0) + 1;
    }

    const uptimePercentage = totalMinutes
      ? (minutesByKind.OPERATING / (24 * 60)) * 100
      : 0;

    return {
      minutesByKind,
      repairBySystemHours,
      movementsSummary,
      uptimePercentage,
      totalMinutes,
    };
  }

  private diffMinutes(start: Date, end: Date): number {
    return Math.max(0, (end.getTime() - start.getTime()) / 60000);
  }
}

export namespace EfficiencyDayTotalsService {
  export type Input = {
    segments: DaySegment[];
    movements: DayMovement[];
  };
}
