import { Injectable } from "@kernel/decorators/Injectable";
import { UserRigAccessRepository } from "@infra/database/neon/repositories/UserRigAccessRepository";
import { NotFoundException } from "@application/errors/http/NotFoundException";

@Injectable()
export class DeleteUserRigAccessUseCase {
  constructor(private readonly repo: UserRigAccessRepository) {}

  async execute(
    _actingUserId: string,
    input: DeleteUserRigAccessUseCase.Input
  ): Promise<void> {
    const deleted = await this.repo.revoke(input.userId, input.rigId);

    if (!deleted) {
      throw new NotFoundException("User rig access not found");
    }
  }
}

export namespace DeleteUserRigAccessUseCase {
  export type Input = {
    userId: string;
    rigId: string;
  };
}
