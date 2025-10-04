// infra/db/repositories/UserRigAccessRepository.ts
import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { userRigAccess, users, rigs } from "../schema";
import { and, eq } from "drizzle-orm";
import { UserRigAccessItem } from "../items/UserRigAccessItem";
import { UserRigAccess } from "@application/entities/UserRigAcess";

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

  async revoke(userId: string, rigId: string): Promise<void> {
    await this.database.db
      .delete(userRigAccess)
      .where(
        and(eq(userRigAccess.userId, userId), eq(userRigAccess.rigId, rigId))
      );
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

  async listRigsForUser(userId: string, limit = 100, offset = 0) {
    const rows = await this.database.db
      .select({
        userId: userRigAccess.userId,
        rigId: userRigAccess.rigId,
        level: userRigAccess.level,
        assignedByUserId: userRigAccess.assignedByUserId,
        createdAt: userRigAccess.createdAt,
        updatedAt: userRigAccess.updatedAt,
        rigName: rigs.name,
      })
      .from(userRigAccess)
      .innerJoin(rigs, eq(rigs.id, userRigAccess.rigId))
      .where(eq(userRigAccess.userId, userId))
      .limit(limit)
      .offset(offset);

    return rows.map(
      (r) =>
        new UserRigAccess({
          userId: r.userId,
          rigId: r.rigId,
          level: r.level as UserRigAccess["level"],
          assignedByUserId: r.assignedByUserId ?? null,
          createdAt: r.createdAt ?? undefined,
          updatedAt: r.updatedAt ?? undefined,
        })
    );
  }

  async listUsersForRig(rigId: string, limit = 100, offset = 0) {
    const rows = await this.database.db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        level: userRigAccess.level,
        assignedByUserId: userRigAccess.assignedByUserId,
        createdAt: userRigAccess.createdAt,
        updatedAt: userRigAccess.updatedAt,
      })
      .from(userRigAccess)
      .innerJoin(users, eq(users.id, userRigAccess.userId))
      .where(eq(userRigAccess.rigId, rigId))
      .limit(limit)
      .offset(offset);

    return rows.map((r) => ({
      userId: r.userId,
      userName: r.userName,
      userEmail: r.userEmail,
      level: r.level,
      assignedByUserId: r.assignedByUserId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }
}
