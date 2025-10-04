import { MODULE_KEYS } from "@application/constants/moduleKeys";
import { Rig } from "@application/entities/Rig";
import { PermissionService } from "@application/services/PermissionService";
import { RoleService } from "@application/services/RoleService";
import { RigRepository } from "@infra/database/neon/repositories/RigRepository";
import { Injectable } from "@kernel/decorators/Injectable";

import { CreateRigUseCase } from "./CreateRigUseCase";

@Injectable()
export class UpdateRigUseCase {
  constructor(
    private readonly rigRepository: RigRepository,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService
  ) {}

  async execute(
    actingUserId: string,
    {
      rigId,
      isActive,
      name,
      timezone,
      uf,
      baseId,
      clientId,
      contractId,
    }: UpdateRigUseCase.Input
  ): Promise<UpdateRigUseCase.Output> {
    await this.roleService.ensureModuleAccess(
      MODULE_KEYS.RIGS,
      "admin",
      actingUserId
    );

    await this.permissionService.ensureRigAccess(
      actingUserId,
      rigId,
      "admin"
    );

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
