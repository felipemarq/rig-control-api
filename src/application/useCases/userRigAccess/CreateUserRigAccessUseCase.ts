import { CreateUserRigAccessBody } from "@application/controllers/usersRigAcesss/schema/userRigAccessSchemas";
import { UserRigAccess } from "@application/entities/UserRigAcess";
import { PermissionService } from "@application/services/PermissionService";
import { RoleService } from "@application/services/RoleService";
import { UserRigAccessRepository } from "@infra/database/neon/repositories/UserRigAccessRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { MODULE_KEYS } from "@application/constants/moduleKeys";

@Injectable()
export class CreateUserRigAccessUseCase {
  constructor(
    private readonly repo: UserRigAccessRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService
  ) {}

  async execute(
    actingUserId: string, // ADM
    input: CreateUserRigAccessBody
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

    const access = new UserRigAccess({
      userId: input.userId,
      rigId: input.rigId,
      level: input.level ?? "read",
    });
    return this.repo.upsert(access, actingUserId);
  }
}
