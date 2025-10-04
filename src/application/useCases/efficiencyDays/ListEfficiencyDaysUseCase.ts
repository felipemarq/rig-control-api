import { listEfficiencyDayQuerySchema } from "@application/controllers/efficiencyDays/schemas/listEfficiencyDayQuerySchema";
import { ListEfficiencyDayQuery } from "@application/controllers/efficiencyDays/schemas/listEfficiencyDayQuerySchema";
import { MODULE_KEYS } from "@application/constants/moduleKeys";
import { PermissionService } from "@application/services/PermissionService";
import { RoleService } from "@application/services/RoleService";
import { Injectable } from "@kernel/decorators/Injectable";
import { EfficiencyDayRepository } from "@infra/database/neon/repositories/EfficiencyDayRepository";

@Injectable()
export class ListEfficiencyDaysUseCase {
  constructor(
    private readonly efficiencyDayRepository: EfficiencyDayRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService
  ) {}

  async execute(
    actingUserId: string,
    input: ListEfficiencyDaysUseCase.Input
  ): Promise<ListEfficiencyDaysUseCase.Output> {
    await this.roleService.ensureModuleAccess(
      MODULE_KEYS.EFFICIENCY,
      "read",
      actingUserId
    );

    await this.permissionService.ensureRigAccess(actingUserId, input.rigId, "read");

    const filters = listEfficiencyDayQuerySchema.parse({
      ...input.query,
      rigId: input.rigId,
    });

    return this.efficiencyDayRepository.list(filters);
  }
}

export namespace ListEfficiencyDaysUseCase {
  export type Input = { rigId: string; query: ListEfficiencyDayQuery };

  export type Output = Awaited<ReturnType<EfficiencyDayRepository["list"]>>;
}
