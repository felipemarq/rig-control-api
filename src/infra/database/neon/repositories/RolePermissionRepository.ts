import { AccessLevel, getHigherAccessLevel } from "@application/types/AccessLevel";
import { Injectable } from "@kernel/decorators/Injectable";
import { and, eq } from "drizzle-orm";

import { DatabaseService } from "..";
import { modules, rolePermissions, userRoles } from "../schema";

@Injectable()
export class RolePermissionRepository {
  constructor(private readonly database: DatabaseService) {}

  async findHighestLevelByUserAndModule(
    userId: string,
    moduleKey: string
  ): Promise<AccessLevel | null> {
    const rows = await this.database.db
      .select({ level: rolePermissions.level })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
      .innerJoin(modules, eq(modules.id, rolePermissions.moduleId))
      .where(and(eq(userRoles.userId, userId), eq(modules.key, moduleKey)));

    if (rows.length === 0) {
      return null;
    }

    return rows.reduce<AccessLevel>((highest, current) => {
      return getHigherAccessLevel(highest, current.level as AccessLevel);
    }, "none");
  }
}
