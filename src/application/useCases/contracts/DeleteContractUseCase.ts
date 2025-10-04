import { ContractRepository } from "@infra/database/neon/repositories/ContractRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { NotFoundException } from "@application/errors/http/NotFoundException";

@Injectable()
export class DeleteContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute({
    contractId,
  }: DeleteContractUseCase.Input): Promise<void> {
    const deleted = await this.contractRepository.delete(contractId);

    if (!deleted) {
      throw new NotFoundException("Contract not found");
    }
  }
}

export namespace DeleteContractUseCase {
  export type Input = {
    contractId: string;
  };
}
