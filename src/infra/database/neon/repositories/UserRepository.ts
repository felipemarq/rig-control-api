import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { User } from "@application/entities/User";
import { eq } from "drizzle-orm";
import { users } from "../schema";

@Injectable()
export class UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(user: User) {
    const { name, email } = user;
    const [userCreated] = await this.databaseService.db
      .insert(users)
      .values({ name, email })
      .returning({
        id: users.id,
        name: users.name,
      });

    return userCreated;
  }

  async findByEmail(email: string) {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return null;
    }
    return new User({ ...user, externalId: user?.externalId ?? undefined });
  }

  async setExternalId(externalId: string, userId: string) {
    const user = await this.databaseService.db
      .update(users)
      .set({
        externalId: externalId,
      })
      .where(eq(users.id, userId))
      .returning();
  }

  async delete(userId: string) {
    await this.databaseService.db.delete(users).where(eq(users.id, userId));
  }
}
