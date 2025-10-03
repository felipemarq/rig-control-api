import { Contract } from "@application/entities/Contract";
import { ContractRepository } from "@infra/database/neon/repositories/ContractRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute({
    clientId,
    code,
    startAt,
    status,
    endAt,
  }: CreateContractUseCase.Input): Promise<CreateContractUseCase.Output> {
    const contract = new Contract({
      clientId,
      code,
      startAt,
      status,
      endAt,
    });

    const createdContract = await this.contractRepository.create(contract);

    return createdContract;
  }
}

export namespace CreateContractUseCase {
  export type Input = {
    clientId: string;
    code: string;
    startAt: Date;
    status?: Contract.Status;
    endAt?: Date;
  };

  export type Output = Contract;
}
