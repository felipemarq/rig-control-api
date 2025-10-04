import { MODULE_KEYS } from "@application/constants/moduleKeys";
import { UpdateUserRigAccessBody } from "@application/controllers/usersRigAcesss/schema/userRigAccessSchemas";
import { UserRigAccess } from "@application/entities/UserRigAcess";
import { PermissionService } from "@application/services/PermissionService";
import { RoleService } from "@application/services/RoleService";
import { UserRigAccessRepository } from "@infra/database/neon/repositories/UserRigAccessRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class UpdateUserRigAccessUseCase {
  constructor(
    private readonly repo: UserRigAccessRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService
  ) {}

  async execute(
    actingUserId: string,
    input: UpdateUserRigAccessBody
  ): Promise<UserRigAccess> {
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

    return this.repo.updateLevel(input.userId, input.rigId, input.level);
  }
}
