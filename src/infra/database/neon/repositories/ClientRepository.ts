import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { clients } from "../schema";
import { Client } from "@application/entities/Client";
import { ClientItem } from "../items/ClientItem";
import { eq } from "drizzle-orm";

@Injectable()
export class ClientRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(client: Client) {
    const rowToInsert = ClientItem.toRow(client);
    const [clientCreated] = await this.databaseService.db
      .insert(clients)
      .values(rowToInsert)
      .returning();

    return ClientItem.fromRow(clientCreated);
  }

  async update(clientId: string, client: Client): Promise<Client> {
    const row = ClientItem.toRow(client);
    const rowToInsert = { ...row, updatedAt: new Date() };
    const [updated] = await this.databaseService.db
      .update(clients)
      .set(rowToInsert)
      .where(eq(clients.id, clientId))
      .returning();
    return ClientItem.fromRow(updated);
  }
}
