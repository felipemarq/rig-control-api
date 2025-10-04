import { MODULE_KEYS } from "@application/constants/moduleKeys";
import { NotFoundException } from "@application/errors/http/NotFoundException";
import { PermissionService } from "@application/services/PermissionService";
import { RoleService } from "@application/services/RoleService";
import { UserRigAccessRepository } from "@infra/database/neon/repositories/UserRigAccessRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class DeleteUserRigAccessUseCase {
  constructor(
    private readonly repo: UserRigAccessRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService
  ) {}

  async execute(
    actingUserId: string,
    input: DeleteUserRigAccessUseCase.Input
  ): Promise<void> {
    await this.roleService.ensureModuleAccess(
      MODULE_KEYS.RIG_ACCESS,
      "admin",
      actingUserId
    );

    await this.permissionService.ensureRigAccess(
      actingUserId,
      input.rigId,
      "admin"
    );

    const deleted = await this.repo.revoke(input.userId, input.rigId);

    if (!deleted) {
      throw new NotFoundException("User rig access not found");
    }
  }
}

export namespace DeleteUserRigAccessUseCase {
  export type Input = {
    userId: string;
    rigId: string;
  };
}
