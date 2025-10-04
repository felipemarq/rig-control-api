import { UpdateUserRigAccessBody } from "@application/controllers/usersRigAcesss/schema/userRigAccessSchemas";
import { UserRigAccess } from "@application/entities/UserRigAcess";
import { UserRigAccessRepository } from "@infra/database/neon/repositories/UserRigAccessRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class UpdateUserRigAccessUseCase {
  constructor(private readonly repo: UserRigAccessRepository) {}

  async execute(
    actingUserId: string,
    input: UpdateUserRigAccessBody
  ): Promise<UserRigAccess> {
    // validar permissão do actingUserId
    return this.repo.updateLevel(input.userId, input.rigId, input.level);
  }
}
