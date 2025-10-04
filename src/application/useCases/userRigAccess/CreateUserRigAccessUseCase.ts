import { CreateUserRigAccessBody } from "@application/controllers/usersRigAcesss/schema/userRigAccessSchemas";
import { UserRigAccess } from "@application/entities/UserRigAcess";
import { UserRigAccessRepository } from "@infra/database/neon/repositories/UserRigAccessRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateUserRigAccessUseCase {
  constructor(private readonly repo: UserRigAccessRepository) {}

  async execute(
    actingUserId: string, // ADM
    input: CreateUserRigAccessBody
  ): Promise<UserRigAccess> {
    // Aqui você pode validar se actingUserId é ADMIN global, ou ADMIN de módulos
    // ou ADMIN em todas as sondas. Para simplificar, assumo que passou pelo guard.
    const access = new UserRigAccess({
      userId: input.userId,
      rigId: input.rigId,
      level: input.level ?? "read",
    });
    return this.repo.upsert(access, actingUserId);
  }
}
