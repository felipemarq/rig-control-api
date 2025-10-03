import { ListContractQuery } from "@application/controllers/contracts/schemas/listContractQuerySchema";
import { ListContractItem } from "@application/queries/types/ListTransactionItem";
import { ContractRepository } from "@infra/database/neon/repositories/ContractRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class ListContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    listContractInput: ListContractUseCase.Input
  ): Promise<ListContractUseCase.Output> {
    const result = await this.contractRepository.listAll({
      filters: {
        ...listContractInput,
        page: listContractInput.page ?? "1",
        pageSize: listContractInput.pageSize ?? "10",
      },
    });

    return result;
  }
}

export namespace ListContractUseCase {
  export type Input = ListContractQuery;
  export type Output = {
    items: ListContractItem[];
    total: number;
    page: string | undefined;
    pageSize: number;
    hasNext: boolean;
  };
}
