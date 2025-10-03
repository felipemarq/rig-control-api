import { Contract } from "@application/entities/Contract";
import { ContractRepository } from "@infra/database/neon/repositories/ContractRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { CreateContractUseCase } from "./CreateContractUseCase";

@Injectable()
export class UpdateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute({
    contractId,
    clientId,
    code,
    startAt,
    status,
    endAt,
  }: UpdateContractUseCase.Input): Promise<UpdateContractUseCase.Output> {
    const contract = new Contract({
      id: contractId,
      clientId,
      code,
      startAt,
      status,
      endAt,
    });

    const updatedContract = await this.contractRepository.update(
      contractId,
      contract
    );

    return updatedContract;
  }
}

export namespace UpdateContractUseCase {
  export type Input = CreateContractUseCase.Input & {
    contractId: string;
  };

  export type Output = Contract;
}
