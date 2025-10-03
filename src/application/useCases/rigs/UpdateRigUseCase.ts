import { Contract } from "@application/entities/Contract";
import { ContractRepository } from "@infra/database/neon/repositories/ContractRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { CreateRigUseCase } from "./CreateRigUseCase";
import { Rig } from "@application/entities/Rig";
import { RigRepository } from "@infra/database/neon/repositories/RigRepository";

@Injectable()
export class UpdateRigUseCase {
  constructor(private readonly rigRepository: RigRepository) {}

  async execute({
    rigId,
    isActive,
    name,
    timezone,
    uf,
    baseId,
    clientId,
    contractId,
  }: UpdateRigUseCase.Input): Promise<UpdateRigUseCase.Output> {
    const rig = new Rig({
      contractId,
      isActive,
      name,
      timezone,
      uf,
      baseId,
      clientId,
    });

    const updatedRig = await this.rigRepository.update(rigId, rig);

    return updatedRig;
  }
}

export namespace UpdateRigUseCase {
  export type Input = CreateRigUseCase.Input & {
    rigId: string;
  };

  export type Output = Rig;
}
