import { ForbiddenException } from "@application/errors/http/ForbiddenException";
import { AccessLevel, hasSufficientAccess } from "@application/types/AccessLevel";
import { Injectable } from "@kernel/decorators/Injectable";

import { UserRigAccessRepository } from "@infra/database/neon/repositories/UserRigAccessRepository";

@Injectable()
export class PermissionService {
  private readonly cache = new Map<string, Map<string, AccessLevel>>();

  constructor(
    private readonly userRigAccessRepository: UserRigAccessRepository
  ) {}

  async ensureRigAccess(
    userId: string,
    rigId: string,
    requiredLevel: AccessLevel
  ): Promise<void> {
    const accessLevel = await this.getRigAccessLevel(userId, rigId);

    if (!hasSufficientAccess(accessLevel, requiredLevel)) {
      throw new ForbiddenException("User lacks required rig permission");
    }
  }

  private async getRigAccessLevel(
    userId: string,
    rigId: string
  ): Promise<AccessLevel> {
    const cached = this.cache.get(userId)?.get(rigId);

    if (cached) {
      return cached;
    }

    const access = await this.userRigAccessRepository.find(userId, rigId);
    const level = access?.level ?? "none";

    let userCache = this.cache.get(userId);
    if (!userCache) {
      userCache = new Map<string, AccessLevel>();
      this.cache.set(userId, userCache);
    }

    userCache.set(rigId, level);

    return level;
  }
}
