import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { rigs } from "../schema";
import { eq } from "drizzle-orm";
import { Rig } from "@application/entities/Rig";
import { RigItem } from "../items/RigItem";

@Injectable()
export class RigRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(rig: Rig) {
    const rowToInsert = RigItem.toRow(rig);
    const [rigCreated] = await this.databaseService.db
      .insert(rigs)
      .values(rowToInsert)
      .returning();

    return RigItem.fromRow(rigCreated);
  }

  async update(rigId: string, rig: Rig): Promise<Rig> {
    const row = RigItem.toRow(rig);
    const rowToInsert = { ...row, updatedAt: new Date() };
    const [updated] = await this.databaseService.db
      .update(rigs)
      .set(rowToInsert)
      .where(eq(rigs.id, rigId))
      .returning();
    return RigItem.fromRow(updated);
  }
}
