import { randomUUID } from "node:crypto";

import { SaveEfficiencyDayBody } from "@application/controllers/efficiencyDays/schemas/saveEfficiencyDaySchema";
import { MODULE_KEYS } from "@application/constants/moduleKeys";
import { EfficiencyDay } from "@application/entities/EfficiencyDay";
import { DayMeasure } from "@application/entities/DayMeasure";
import { DayMovement, DistanceTier } from "@application/entities/DayMovement";
import { DayMovementSegment } from "@application/entities/DayMovementSegment";
import { DaySegment } from "@application/entities/DaySegment";
import { BadRequestException } from "@application/errors/http/BadRequestException";
import { EfficiencyDayTotalsService } from "@application/services/EfficiencyDayTotalsService";
import { PermissionService } from "@application/services/PermissionService";
import { RoleService } from "@application/services/RoleService";
import { Injectable } from "@kernel/decorators/Injectable";
import { EfficiencyDayRepository } from "@infra/database/neon/repositories/EfficiencyDayRepository";

@Injectable()
export class UpsertEfficiencyDayUseCase {
  constructor(
    private readonly efficiencyDayRepository: EfficiencyDayRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly totalsService: EfficiencyDayTotalsService
  ) {}

  async execute(
    actingUserId: string,
    input: UpsertEfficiencyDayUseCase.Input
  ): Promise<UpsertEfficiencyDayUseCase.Output> {
    await this.roleService.ensureModuleAccess(
      MODULE_KEYS.EFFICIENCY,
      "write",
      actingUserId
    );
    await this.permissionService.ensureRigAccess(
      actingUserId,
      input.rigId,
      "write"
    );

    const existing = await this.efficiencyDayRepository.findByRigAndDate(
      input.rigId,
      input.localDate
    );

    if (existing?.status === "confirmed") {
      throw new BadRequestException("Confirmed efficiency days cannot be edited");
    }

    const targetStatus = input.status ?? existing?.status ?? "draft";

    if (input.status === "confirmed") {
      throw new BadRequestException(
        "Use the status endpoint to confirm an efficiency day"
      );
    }

    const segments = input.segments.map((segment) => {
      const startsAt = new Date(segment.startsAt);
      const endsAt = new Date(segment.endsAt);

      if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
        throw new BadRequestException("Segment timestamps must be valid ISO dates");
      }

      if (endsAt.getTime() <= startsAt.getTime()) {
        throw new BadRequestException("Segment end must be after start");
      }

      if (segment.kind === "REPAIR" && !segment.repairSystemId) {
        throw new BadRequestException(
          "Repair segments require a repairSystemId"
        );
      }

      return new DaySegment({
        id: segment.id ?? randomUUID(),
        kind: segment.kind,
        subtype: segment.subtype ?? null,
        startsAt,
        endsAt,
        wellId: segment.wellId ?? null,
        repairSystemId: segment.repairSystemId ?? null,
        repairPartId: segment.repairPartId ?? null,
        notes: segment.notes ?? null,
      });
    });

    const sortedSegments = [...segments].sort(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime()
    );

    for (let index = 1; index < sortedSegments.length; index += 1) {
      const previous = sortedSegments[index - 1];
      const current = sortedSegments[index];

      if (current.startsAt.getTime() < previous.endsAt.getTime()) {
        throw new BadRequestException("Segments cannot overlap");
      }
    }

    const movements = input.movements.map((movement) => {
      const startedAt = movement.startedAt
        ? new Date(movement.startedAt)
        : null;
      const endedAt = movement.endedAt ? new Date(movement.endedAt) : null;

      if (
        (startedAt && Number.isNaN(startedAt.getTime())) ||
        (endedAt && Number.isNaN(endedAt.getTime()))
      ) {
        throw new BadRequestException("Movement timestamps must be valid ISO dates");
      }

      if (movement.distanceKm < 0) {
        throw new BadRequestException("Movement distance must be zero or positive");
      }

      return new DayMovement({
        id: movement.id ?? randomUUID(),
        type: movement.type,
        distanceKm: movement.distanceKm,
        tier: movement.tier ?? this.calculateTier(movement.distanceKm),
        startedAt,
        endedAt,
        notes: movement.notes ?? null,
      });
    });

    const measures = input.measures.map(
      (measure) =>
        new DayMeasure({
          id: measure.id ?? randomUUID(),
          key: measure.key,
          unit: measure.unit,
          value: measure.value,
          meta: measure.meta ?? null,
        })
    );

    const segmentIds = new Set(segments.map((segment) => segment.id));
    const movementIds = new Set(movements.map((movement) => movement.id));

    const seenLinks = new Set<string>();

    const movementSegments = input.movementSegments.map((movementSegment) => {
      if (!movementIds.has(movementSegment.dayMovementId)) {
        throw new BadRequestException("Movement segment references unknown movement");
      }

      if (!segmentIds.has(movementSegment.daySegmentId)) {
        throw new BadRequestException("Movement segment references unknown segment");
      }

      const linkKey = `${movementSegment.dayMovementId}-${movementSegment.daySegmentId}`;
      if (seenLinks.has(linkKey)) {
        throw new BadRequestException("Movement segment links must be unique");
      }
      seenLinks.add(linkKey);

      return new DayMovementSegment({
        dayMovementId: movementSegment.dayMovementId,
        daySegmentId: movementSegment.daySegmentId,
      });
    });

    const totals = this.totalsService.calculate({
      segments,
      movements,
    });

    if (targetStatus !== "draft") {
      const minutesInDay = 24 * 60;
      const diff = Math.abs(totals.totalMinutes - minutesInDay);
      if (diff > 1e-6) {
        throw new BadRequestException(
          "Segments must cover 24 hours before closing the day"
        );
      }
    }

    const day = new EfficiencyDay({
      id: existing?.id,
      rigId: input.rigId,
      localDate: input.localDate,
      status: targetStatus,
      totals,
      confirmedAt: existing?.confirmedAt ?? null,
      confirmedByUserId: existing?.confirmedByUserId ?? null,
      segments,
      movements,
      movementSegments,
      measures,
    });

    return this.efficiencyDayRepository.upsert(day);
  }

  private calculateTier(distance: number): DistanceTier {
    if (distance <= 20) {
      return "KM_0_20";
    }

    if (distance <= 50) {
      return "KM_20_50";
    }

    return "KM_50_PLUS";
  }
}

export namespace UpsertEfficiencyDayUseCase {
  export type Input = SaveEfficiencyDayBody & { rigId: string };

  export type Output = EfficiencyDay;
}
