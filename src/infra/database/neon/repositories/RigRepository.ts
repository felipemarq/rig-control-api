import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { bases, clients, contracts, rigs } from "../schema";
import { SQL, and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { Rig } from "@application/entities/Rig";
import { RigItem } from "../items/RigItem";
import { ListRigQuery } from "@application/controllers/rigs/schemas/listRigQuerySchema";
import { ListRigItem } from "@application/queries/types/ListRigItem";
import { ClientItem } from "../items/ClientItem";
import { ContractItem } from "../items/ContractItem";

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

  async findById(rigId: string): Promise<ListRigItem | null> {
    const [row] = await this.databaseService.db
      .select({
        rigs: rigs,
        clients: clients,
        contracts: contracts,
        bases: bases,
      })
      .from(rigs)
      .leftJoin(clients, eq(clients.id, rigs.clientId))
      .leftJoin(contracts, eq(contracts.id, rigs.contractId))
      .leftJoin(bases, eq(bases.id, rigs.baseId))
      .where(eq(rigs.id, rigId));

    if (!row) {
      return null;
    }

    return this.mapRowToItem(row);
  }

  async delete(rigId: string): Promise<boolean> {
    const [deleted] = await this.databaseService.db
      .delete(rigs)
      .where(eq(rigs.id, rigId))
      .returning({ id: rigs.id });

    return Boolean(deleted);
  }

  async listAll({ filters }: { filters: ListRigQuery }) {
    const limit = Math.min(Math.max(Number(filters.pageSize ?? "10"), 1), 100);
    const page = Math.max(Number(filters.page ?? "1"), 1);
    const offset = (page - 1) * limit;

    const whereConditions: SQL<unknown>[] = [];

    if (filters.clientId?.length) {
      whereConditions.push(inArray(rigs.clientId, filters.clientId));
    }

    if (filters.contractId?.length) {
      whereConditions.push(inArray(rigs.contractId, filters.contractId));
    }

    if (filters.baseId?.length) {
      whereConditions.push(inArray(rigs.baseId, filters.baseId));
    }

    if (filters.uf?.length) {
      whereConditions.push(inArray(rigs.uf, filters.uf));
    }

    if (filters.isActive) {
      whereConditions.push(eq(rigs.isActive, filters.isActive === "true"));
    }

    if (filters.search) {
      whereConditions.push(ilike(rigs.name, `%${filters.search}%`));
    }

    const whereExpr = whereConditions.length
      ? and(...whereConditions)
      : undefined;

    const totalQuery = this.databaseService.db
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(rigs);

    const [{ total }] = await (whereExpr
      ? totalQuery.where(whereExpr)
      : totalQuery);

    const orderCol =
      filters.sortBy === "createdAt"
        ? rigs.createdAt
        : filters.sortBy === "uf"
        ? rigs.uf
        : rigs.name;

    const orderMain =
      filters.sortDir === "desc" ? desc(orderCol as any) : asc(orderCol as any);
    const orderTiebreakers = [desc(rigs.createdAt), desc(rigs.id)];

    const baseRowsQuery = this.databaseService.db
      .select({
        rigs: rigs,
        clients: clients,
        contracts: contracts,
        bases: bases,
      })
      .from(rigs)
      .leftJoin(clients, eq(clients.id, rigs.clientId))
      .leftJoin(contracts, eq(contracts.id, rigs.contractId))
      .leftJoin(bases, eq(bases.id, rigs.baseId));

    const rows = await (whereExpr
      ? baseRowsQuery.where(whereExpr)
      : baseRowsQuery
    )
      .orderBy(orderMain, ...orderTiebreakers)
      .limit(limit)
      .offset(offset);

    const items = rows.map((row) => this.mapRowToItem(row));

    const hasNext = page * limit < total;

    return { items, total, page: filters.page, pageSize: limit, hasNext };
  }

  private mapRowToItem(row: {
    rigs: typeof rigs.$inferSelect;
    clients: typeof clients.$inferSelect | null;
    contracts: typeof contracts.$inferSelect | null;
    bases: typeof bases.$inferSelect | null;
  }): ListRigItem {
    const rig = RigItem.fromRow(row.rigs);
    const client = row.clients ? ClientItem.fromRow(row.clients) : null;
    const contract = row.contracts ? ContractItem.fromRow(row.contracts) : null;
    const base = row.bases
      ? {
          id: row.bases.id,
          name: row.bases.name,
          uf: row.bases.uf as Rig["uf"],
          stateFlagKey: row.bases.stateFlagKey ?? null,
        }
      : null;

    return {
      ...rig,
      client,
      contract,
      base,
    };
  }
}
