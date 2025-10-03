import { CreateRigBody } from "@application/controllers/rigs/schemas/createRigSchema";
import { Contract } from "@application/entities/Contract";
import { Rig } from "@application/entities/Rig";
import { RigRepository } from "@infra/database/neon/repositories/RigRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateRigUseCase {
  constructor(private readonly rigRepository: RigRepository) {}

  async execute({
    isActive,
    name,
    clientId,
    contractId,
    baseId,
    uf,
    timezone,
  }: CreateRigUseCase.Input): Promise<CreateRigUseCase.Output> {
    const rig = new Rig({
      isActive,
      name,
      clientId,
      contractId,
      baseId,
      uf,
      timezone,
    });

    const createdRig = await this.rigRepository.create(rig);

    return createdRig;
  }
}

export namespace CreateRigUseCase {
  export type Input = CreateRigBody;

  export type Output = Rig;
}
