import { ListContractItem } from "@application/queries/types/ListTransactionItem";
import { ContractRepository } from "@infra/database/neon/repositories/ContractRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { NotFoundException } from "@application/errors/http/NotFoundException";

@Injectable()
export class GetContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute({
    contractId,
  }: GetContractUseCase.Input): Promise<GetContractUseCase.Output> {
    const contract = await this.contractRepository.findById(contractId);

    if (!contract) {
      throw new NotFoundException("Contract not found");
    }

    return contract;
  }
}

export namespace GetContractUseCase {
  export type Input = {
    contractId: string;
  };

  export type Output = ListContractItem;
}
