import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { clients, contracts } from "../schema";
import {
  SQL,
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  sql,
} from "drizzle-orm";
import { Contract } from "@application/entities/Contract";
import { ContractItem } from "../items/ContractItem";
import { ListContractQuery } from "@application/controllers/contracts/schemas/listContractQuerySchema";

@Injectable()
export class ContractRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(contract: Contract) {
    const rowToInsert = ContractItem.toRow(contract);
    const [contractCreated] = await this.databaseService.db
      .insert(contracts)
      .values(rowToInsert)
      .returning();

    return ContractItem.fromRow(contractCreated);
  }

  async update(contractId: string, contract: Contract): Promise<Contract> {
    const row = ContractItem.toRow(contract);
    const rowToInsert = { ...row, updatedAt: new Date() };
    const [updated] = await this.databaseService.db
      .update(contracts)
      .set(rowToInsert)
      .where(eq(contracts.id, contractId))
      .returning();
    return ContractItem.fromRow(updated);
  }

  async listAll({ filters }: { filters: ListContractQuery }) {
    const limit = Math.min(Math.max(Number(filters.pageSize ?? "10"), 1), 100);
    const page = Math.max(Number(filters.page ?? "1"), 1);
    const offset = (page - 1) * limit;

    const whereConditions: SQL<unknown>[] = [];

    if (filters.clientId?.length) {
      whereConditions.push(inArray(contracts.clientId, filters.clientId));
    }

    if (filters.search) {
      whereConditions.push(ilike(contracts.code, `%${filters.search}%`));
    }

    const whereExpr = whereConditions.length
      ? and(...whereConditions)
      : undefined;

    const totalQuery = this.databaseService.db
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(contracts);

    const [{ total }] = await (whereExpr
      ? totalQuery.where(whereExpr)
      : totalQuery);

    const orderCol =
      filters.sortBy === "code"
        ? contracts.code
        : filters.sortBy === "createdAt"
        ? contracts.createdAt
        : contracts.code;

    const orderMain =
      filters.sortDir === "asc" ? asc(orderCol as any) : desc(orderCol as any);
    const orderTiebreakers = [desc(contracts.createdAt), desc(contracts.id)];

    const baseRowsQuery = this.databaseService.db
      .select({
        contracts: contracts,
        clients: clients,
      })
      .from(contracts)
      .leftJoin(clients, eq(clients.id, contracts.clientId));

    const rows = await (whereExpr
      ? baseRowsQuery.where(whereExpr)
      : baseRowsQuery)
      .orderBy(orderMain, ...orderTiebreakers)
      .limit(limit)
      .offset(offset);

    const items = rows.map(({ contracts, clients }) => {
      const contract = ContractItem.fromRow(contracts);

      return {
        ...contract,
        client: clients ? { ...clients } : null,
      };
    });

    const hasNext = page * limit < total;
    return { items, total, page: filters.page, pageSize: limit, hasNext };
  }

  async findById(contractId: string) {
    const [row] = await this.databaseService.db
      .select({
        contracts: contracts,
        clients: clients,
      })
      .from(contracts)
      .leftJoin(clients, eq(clients.id, contracts.clientId))
      .where(eq(contracts.id, contractId));

    if (!row) {
      return null;
    }

    const contract = ContractItem.fromRow(row.contracts);

    return {
      ...contract,
      client: row.clients ? { ...row.clients } : null,
    };
  }

  async delete(contractId: string): Promise<boolean> {
    const [deleted] = await this.databaseService.db
      .delete(contracts)
      .where(eq(contracts.id, contractId))
      .returning({ id: contracts.id });

    return Boolean(deleted);
  }
}
