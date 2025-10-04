import { ListRigItem } from "@application/queries/types/ListRigItem";
import { RigRepository } from "@infra/database/neon/repositories/RigRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { NotFoundException } from "@application/errors/http/NotFoundException";

@Injectable()
export class GetRigUseCase {
  constructor(private readonly rigRepository: RigRepository) {}

  async execute({ rigId }: GetRigUseCase.Input): Promise<ListRigItem> {
    const rig = await this.rigRepository.findById(rigId);

    if (!rig) {
      throw new NotFoundException("Rig not found");
    }

    return rig;
  }
}

export namespace GetRigUseCase {
  export type Input = {
    rigId: string;
  };
}
