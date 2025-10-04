import { ForbiddenException } from "@application/errors/http/ForbiddenException";
import {
  AccessLevel,
  hasSufficientAccess,
} from "@application/types/AccessLevel";
import { Injectable } from "@kernel/decorators/Injectable";

import { RolePermissionRepository } from "@infra/database/neon/repositories/RolePermissionRepository";

@Injectable()
export class RoleService {
  private readonly cache = new Map<string, Map<string, AccessLevel>>();

  constructor(
    private readonly rolePermissionRepository: RolePermissionRepository
  ) {}

  async ensureModuleAccess(
    moduleKey: string,
    requiredLevel: AccessLevel,
    userId: string
  ): Promise<void> {
    const accessLevel = await this.getModuleAccessLevel(userId, moduleKey);

    if (!hasSufficientAccess(accessLevel, requiredLevel)) {
      throw new ForbiddenException("User lacks required module permission");
    }
  }

  private async getModuleAccessLevel(
    userId: string,
    moduleKey: string
  ): Promise<AccessLevel> {
    const cached = this.cache.get(userId)?.get(moduleKey);

    if (cached) {
      return cached;
    }

    const level =
      (await this.rolePermissionRepository.findHighestLevelByUserAndModule(
        userId,
        moduleKey
      )) ?? "none";

    let userCache = this.cache.get(userId);
    if (!userCache) {
      userCache = new Map<string, AccessLevel>();
      this.cache.set(userId, userCache);
    }

    userCache.set(moduleKey, level);

    return level;
  }
}
