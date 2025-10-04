// infra/db/repositories/UserRigAccessRepository.ts
import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { userRigAccess, users, rigs } from "../schema";
import { and, eq, sql } from "drizzle-orm";
import { UserRigAccessItem } from "../items/UserRigAccessItem";
import { UserRigAccess } from "@application/entities/UserRigAcess";
import { Rig } from "@application/entities/Rig";
import {
  ListRigUsersItem,
  ListUserRigAccessItem,
} from "@application/queries/types/UserRigAccessItems";

@Injectable()
export class UserRigAccessRepository {
  constructor(private readonly database: DatabaseService) {}

  async upsert(
    access: UserRigAccess,
    assignedByUserId: string
  ): Promise<UserRigAccess> {
    const row = UserRigAccessItem.toRow(
      new UserRigAccess({ ...access, assignedByUserId })
    );
    const [saved] = await this.database.db
      .insert(userRigAccess)
      .values(row)
      .onConflictDoUpdate({
        target: [userRigAccess.userId, userRigAccess.rigId],
        set: {
          level: row.level,
          assignedByUserId: row.assignedByUserId,
          updatedAt: new Date(),
        },
      })
      .returning();

    return UserRigAccessItem.fromRow(saved);
  }

  async updateLevel(
    userId: string,
    rigId: string,
    level: UserRigAccess["level"]
  ): Promise<UserRigAccess> {
    const [updated] = await this.database.db
      .update(userRigAccess)
      .set({ level, updatedAt: new Date() })
      .where(
        and(eq(userRigAccess.userId, userId), eq(userRigAccess.rigId, rigId))
      )
      .returning();
    return UserRigAccessItem.fromRow(updated);
  }

  async revoke(userId: string, rigId: string): Promise<boolean> {
    const [deleted] = await this.database.db
      .delete(userRigAccess)
      .where(
        and(eq(userRigAccess.userId, userId), eq(userRigAccess.rigId, rigId))
      )
      .returning({ userId: userRigAccess.userId });

    return Boolean(deleted);
  }

  async find(userId: string, rigId: string): Promise<UserRigAccess | null> {
    const [row] = await this.database.db
      .select()
      .from(userRigAccess)
      .where(
        and(eq(userRigAccess.userId, userId), eq(userRigAccess.rigId, rigId))
      );
    return row ? UserRigAccessItem.fromRow(row) : null;
  }

  async listRigsForUser({
    userId,
    page,
    pageSize,
  }: {
    userId: string;
    page: number;
    pageSize: number;
  }): Promise<{
    items: ListUserRigAccessItem[];
    total: number;
    hasNext: boolean;
    page: number;
    pageSize: number;
  }> {
    const offset = (page - 1) * pageSize;

    let totalQuery = this.database.db
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(userRigAccess)
      .where(eq(userRigAccess.userId, userId));

    const [{ total }] = await totalQuery;

    const rows = await this.database.db
      .select({
        access: userRigAccess,
        rig: rigs,
      })
      .from(userRigAccess)
      .innerJoin(rigs, eq(rigs.id, userRigAccess.rigId))
      .where(eq(userRigAccess.userId, userId))
      .limit(pageSize)
      .offset(offset);

    const items = rows.map(({ access, rig }) => {
      const userRigAccessItem = UserRigAccessItem.fromRow(access);

      return {
        ...userRigAccessItem,
        rig: {
          id: rig.id,
          name: rig.name,
          timezone: rig.timezone,
          uf: rig.uf as Rig["uf"],
        },
      } satisfies ListUserRigAccessItem;
    });

    const hasNext = page * pageSize < total;

    return { items, total, hasNext, page, pageSize };
  }

  async listUsersForRig({
    rigId,
    page,
    pageSize,
  }: {
    rigId: string;
    page: number;
    pageSize: number;
  }): Promise<{
    items: ListRigUsersItem[];
    total: number;
    hasNext: boolean;
    page: number;
    pageSize: number;
  }> {
    const offset = (page - 1) * pageSize;

    const [{ total }] = await this.database.db
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(userRigAccess)
      .where(eq(userRigAccess.rigId, rigId));

    const rows = await this.database.db
      .select({
        access: userRigAccess,
        user: users,
      })
      .from(userRigAccess)
      .innerJoin(users, eq(users.id, userRigAccess.userId))
      .where(eq(userRigAccess.rigId, rigId))
      .limit(pageSize)
      .offset(offset);

    const items = rows.map(({ access, user }) => {
      const userRigAccessItem = UserRigAccessItem.fromRow(access);

      return {
        ...userRigAccessItem,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      } satisfies ListRigUsersItem;
    });

    const hasNext = page * pageSize < total;

    return { items, total, hasNext, page, pageSize };
  }
}
