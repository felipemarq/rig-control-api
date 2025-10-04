import { MODULE_KEYS } from "@application/constants/moduleKeys";
import { NotFoundException } from "@application/errors/http/NotFoundException";
import { PermissionService } from "@application/services/PermissionService";
import { RoleService } from "@application/services/RoleService";
import { RigRepository } from "@infra/database/neon/repositories/RigRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class DeleteRigUseCase {
  constructor(
    private readonly rigRepository: RigRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService
  ) {}

  async execute(
    actingUserId: string,
    { rigId }: DeleteRigUseCase.Input
  ): Promise<void> {
    await this.roleService.ensureModuleAccess(
      MODULE_KEYS.RIGS,
      "admin",
      actingUserId
    );

    await this.permissionService.ensureRigAccess(
      actingUserId,
      rigId,
      "admin"
    );

    const deleted = await this.rigRepository.delete(rigId);

    if (!deleted) {
      throw new NotFoundException("Rig not found");
    }
  }
}

export namespace DeleteRigUseCase {
  export type Input = {
    rigId: string;
  };
}
