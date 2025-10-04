import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { clients } from "../schema";
import { Client } from "@application/entities/Client";
import { ClientItem } from "../items/ClientItem";
import {
  SQL,
  and,
  asc,
  desc,
  eq,
  ilike,
  isNull,
  sql,
} from "drizzle-orm";
import { ListClientQuery } from "@application/controllers/clients/schemas/listClientQuerySchema";

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

  async findById(clientId: string): Promise<Client | null> {
    const whereConditions: SQL<unknown>[] = [
      eq(clients.id, clientId),
      isNull(clients.deletedAt),
    ];

    const [client] = await this.databaseService.db
      .select()
      .from(clients)
      .where(and(...whereConditions));

    if (!client) {
      return null;
    }

    return ClientItem.fromRow(client);
  }

  async delete(clientId: string): Promise<boolean> {
    const [deleted] = await this.databaseService.db
      .update(clients)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(clients.id, clientId), isNull(clients.deletedAt)))
      .returning({ id: clients.id });

    return Boolean(deleted);
  }

  async listAll({ filters }: { filters: ListClientQuery }) {
    const limit = Math.min(Math.max(Number(filters.pageSize ?? "10"), 1), 100);
    const page = Math.max(Number(filters.page ?? "1"), 1);
    const offset = (page - 1) * limit;

    const whereConditions: SQL<unknown>[] = [isNull(clients.deletedAt)];

    if (filters.search) {
      whereConditions.push(ilike(clients.name, `%${filters.search}%`));
    }

    const whereExpr = whereConditions.length
      ? and(...whereConditions)
      : undefined;

    const totalQuery = this.databaseService.db
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(clients);

    const [{ total }] = await (whereExpr
      ? totalQuery.where(whereExpr)
      : totalQuery);

    const orderColumn =
      filters.sortBy === "createdAt" ? clients.createdAt : clients.name;
    const direction =
      filters.sortDir === "desc"
        ? desc(orderColumn as any)
        : asc(orderColumn as any);

    const tieBreakers = [desc(clients.createdAt), desc(clients.id)];

    const baseRowsQuery = this.databaseService.db
      .select({ client: clients })
      .from(clients);

    const rows = await (whereExpr
      ? baseRowsQuery.where(whereExpr)
      : baseRowsQuery)
      .orderBy(direction, ...tieBreakers)
      .limit(limit)
      .offset(offset);

    const items = rows.map(({ client }) => ClientItem.fromRow(client));

    const hasNext = page * limit < total;

    return { items, total, page: filters.page, pageSize: limit, hasNext };
  }
}
