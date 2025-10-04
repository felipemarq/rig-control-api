import { MODULE_KEYS } from "@application/constants/moduleKeys";
import { DayStatus, EfficiencyDay } from "@application/entities/EfficiencyDay";
import { BadRequestException } from "@application/errors/http/BadRequestException";
import { NotFoundException } from "@application/errors/http/NotFoundException";
import { EfficiencyDayTotalsService } from "@application/services/EfficiencyDayTotalsService";
import { PermissionService } from "@application/services/PermissionService";
import { RoleService } from "@application/services/RoleService";
import { Injectable } from "@kernel/decorators/Injectable";
import { EfficiencyDayRepository } from "@infra/database/neon/repositories/EfficiencyDayRepository";

@Injectable()
export class UpdateEfficiencyDayStatusUseCase {
  constructor(
    private readonly efficiencyDayRepository: EfficiencyDayRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly totalsService: EfficiencyDayTotalsService
  ) {}

  async execute(
    actingUserId: string,
    input: UpdateEfficiencyDayStatusUseCase.Input
  ): Promise<UpdateEfficiencyDayStatusUseCase.Output> {
    await this.roleService.ensureModuleAccess(
      MODULE_KEYS.EFFICIENCY,
      "write",
      actingUserId
    );

    await this.permissionService.ensureRigAccess(actingUserId, input.rigId, "write");

    const existing = await this.efficiencyDayRepository.findByRigAndDate(
      input.rigId,
      input.localDate
    );

    if (!existing || !existing.id) {
      throw new NotFoundException("Efficiency day not found");
    }

    if (existing.status === "confirmed" && input.status === "confirmed") {
      return existing;
    }

    if (input.status === "confirmed") {
      if (existing.status === "draft") {
        throw new BadRequestException(
          "Efficiency day must be ready before confirmation"
        );
      }

      const totals = this.totalsService.calculate({
        segments: existing.segments,
        movements: existing.movements,
      });

      const minutesInDay = 24 * 60;
      const diff = Math.abs(totals.totalMinutes - minutesInDay);
      if (diff > 1e-6) {
        throw new BadRequestException(
          "Segments must cover 24 hours before confirmation"
        );
      }
    }

    if (existing.status === "confirmed" && input.status !== "confirmed") {
      throw new BadRequestException(
        "Confirmed efficiency days cannot be reverted"
      );
    }

    const updated = await this.efficiencyDayRepository.updateStatus(
      existing.id,
      input.status,
      input.status === "confirmed" ? actingUserId : null
    );

    if (!updated) {
      throw new NotFoundException("Efficiency day not found");
    }

    return updated;
  }
}

export namespace UpdateEfficiencyDayStatusUseCase {
  export type Input = {
    rigId: string;
    localDate: string;
    status: DayStatus;
  };

  export type Output = EfficiencyDay;
}
