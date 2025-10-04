import { RigRepository } from "@infra/database/neon/repositories/RigRepository";
import { Injectable } from "@kernel/decorators/Injectable";
import { NotFoundException } from "@application/errors/http/NotFoundException";

@Injectable()
export class DeleteRigUseCase {
  constructor(private readonly rigRepository: RigRepository) {}

  async execute({ rigId }: DeleteRigUseCase.Input): Promise<void> {
    const deleted = await this.rigRepository.delete(rigId);

    if (!deleted) {
      throw new NotFoundException("Rig not found");
    }
  }
}

export namespace DeleteRigUseCase {
  export type Input = {
    rigId: string;
  };
}
