import { MODULE_KEYS } from "@application/constants/moduleKeys";
import { EfficiencyDay } from "@application/entities/EfficiencyDay";
import { NotFoundException } from "@application/errors/http/NotFoundException";
import { PermissionService } from "@application/services/PermissionService";
import { RoleService } from "@application/services/RoleService";
import { Injectable } from "@kernel/decorators/Injectable";
import { EfficiencyDayRepository } from "@infra/database/neon/repositories/EfficiencyDayRepository";

@Injectable()
export class GetEfficiencyDayUseCase {
  constructor(
    private readonly efficiencyDayRepository: EfficiencyDayRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService
  ) {}

  async execute(
    actingUserId: string,
    { rigId, localDate }: GetEfficiencyDayUseCase.Input
  ): Promise<GetEfficiencyDayUseCase.Output> {
    await this.roleService.ensureModuleAccess(
      MODULE_KEYS.EFFICIENCY,
      "read",
      actingUserId
    );

    await this.permissionService.ensureRigAccess(actingUserId, rigId, "read");

    const efficiencyDay = await this.efficiencyDayRepository.findByRigAndDate(
      rigId,
      localDate
    );

    if (!efficiencyDay) {
      throw new NotFoundException("Efficiency day not found");
    }

    return efficiencyDay;
  }
}

export namespace GetEfficiencyDayUseCase {
  export type Input = { rigId: string; localDate: string };

  export type Output = EfficiencyDay;
}
