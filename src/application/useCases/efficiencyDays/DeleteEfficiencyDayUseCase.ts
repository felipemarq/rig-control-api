import { MODULE_KEYS } from "@application/constants/moduleKeys";
import { BadRequestException } from "@application/errors/http/BadRequestException";
import { NotFoundException } from "@application/errors/http/NotFoundException";
import { PermissionService } from "@application/services/PermissionService";
import { RoleService } from "@application/services/RoleService";
import { Injectable } from "@kernel/decorators/Injectable";
import { EfficiencyDayRepository } from "@infra/database/neon/repositories/EfficiencyDayRepository";

@Injectable()
export class DeleteEfficiencyDayUseCase {
  constructor(
    private readonly efficiencyDayRepository: EfficiencyDayRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService
  ) {}

  async execute(
    actingUserId: string,
    { rigId, localDate }: DeleteEfficiencyDayUseCase.Input
  ): Promise<void> {
    await this.roleService.ensureModuleAccess(
      MODULE_KEYS.EFFICIENCY,
      "write",
      actingUserId
    );

    await this.permissionService.ensureRigAccess(actingUserId, rigId, "write");

    const existing = await this.efficiencyDayRepository.findByRigAndDate(
      rigId,
      localDate
    );

    if (!existing || !existing.id) {
      throw new NotFoundException("Efficiency day not found");
    }

    if (existing.status === "confirmed") {
      throw new BadRequestException("Confirmed efficiency days cannot be deleted");
    }

    await this.efficiencyDayRepository.delete(existing.id);
  }
}

export namespace DeleteEfficiencyDayUseCase {
  export type Input = { rigId: string; localDate: string };
}
