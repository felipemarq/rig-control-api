import { CreateRigBody } from "@application/controllers/rigs/schemas/createRigSchema";
import { MODULE_KEYS } from "@application/constants/moduleKeys";
import { Rig } from "@application/entities/Rig";
import { RoleService } from "@application/services/RoleService";
import { RigRepository } from "@infra/database/neon/repositories/RigRepository";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateRigUseCase {
  constructor(
    private readonly rigRepository: RigRepository,
    private readonly roleService: RoleService
  ) {}

  async execute(
    actingUserId: string,
    {
      isActive,
      name,
      clientId,
      contractId,
      baseId,
      uf,
      timezone,
    }: CreateRigUseCase.Input
  ): Promise<CreateRigUseCase.Output> {
    await this.roleService.ensureModuleAccess(
      MODULE_KEYS.RIGS,
      "admin",
      actingUserId
    );

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
