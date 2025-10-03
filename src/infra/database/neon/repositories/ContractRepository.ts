import { Injectable } from "@kernel/decorators/Injectable";
import { DatabaseService } from "..";
import { contracts } from "../schema";
import { eq } from "drizzle-orm";
import { Contract } from "@application/entities/Contract";
import { ContractItem } from "../items/ContractItem";

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
}
