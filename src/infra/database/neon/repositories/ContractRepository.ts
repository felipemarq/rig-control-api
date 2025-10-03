import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { clients, contracts } from "../schema";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
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
    // ---------- mesmo where da sua listAll ----------
    const whereClause = [] as any[];

    if (filters.clientId?.length) {
      whereClause.push(inArray(contracts.clientId, filters.clientId));
    }

    const whereExpr = and(...whereClause);

    // ---------- ordenação/tie-breakers idênticos ----------
    const orderCol =
      filters.sortBy === "code"
        ? contracts.code
        : filters.sortBy === "createdAt"
        ? contracts.createdAt
        : contracts.code;

    const orderMain =
      filters.sortDir === "asc" ? asc(orderCol as any) : desc(orderCol as any);
    const orderTiebreakers = [desc(contracts.createdAt), desc(contracts.id)];

    // ---------- paginação ----------
    const limit = Math.min(Math.max(Number(filters.pageSize ?? "10"), 1), 100);
    const offset = (Math.max(Number(filters.page ?? "1"), 1) - 1) * limit;

    const [{ total }] = await this.databaseService.db
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(contracts)
      .where(whereExpr);

    // ---------- SELECT com aliases (t, acc, cat) ----------
    const rows = await this.databaseService.db
      .select({
        contracts: contracts, // transação inteira (para usar o TransactionItem)
        clients: clients,
      })
      .from(contracts)
      .leftJoin(clients, eq(clients.id, contracts.clientId))

      .where(whereExpr)
      .orderBy(orderMain, ...orderTiebreakers)
      .limit(limit)
      .offset(offset);

    // ---------- mapping (mantém seu TransactionItem) ----------
    const items = rows.map(({ contracts, clients }) => {
      const contract = ContractItem.fromRow(contracts); // aqui você mantém todas as conversões (numeric->number etc)

      return {
        ...contract,
        client: { ...clients },
      };
    });

    const hasNext = Number(filters.page ?? "1") * limit < total;
    return { items, total, page: filters.page, pageSize: limit, hasNext };
  }
}
