import { Controller } from "@application/contracts/Controller";
import { Injectable } from "@kernel/decorators/Injectable";
import { CreateContractUseCase } from "@application/useCases/contracts/CreateContractUseCase";
import { Contract } from "@application/entities/Contract";
import { CreateRigBody } from "./schemas/createRigSchema";
import { CreateRigUseCase } from "@application/useCases/rigs/CreateRigUseCase";
import { Rig } from "@application/entities/Rig";

@Injectable()
export class CreateRigController extends Controller<
  "private",
  CreateRigController.Response
> {
  constructor(private readonly createRigUseCase: CreateRigUseCase) {
    super();
  }

  protected override async handle({
    userId,
    body,
  }: Controller.Request<"private", CreateRigBody>): Promise<
    Controller.Response<CreateRigController.Response>
  > {
    const { isActive, name, timezone, uf, clientId, baseId, contractId } = body;
    const rig = await this.createRigUseCase.execute(userId, {
      isActive,
      name,
      timezone,
      uf,
      clientId,
      baseId,
      contractId,
    });

    return {
      statusCode: 200,
      body: rig,
    };
  }
}

export namespace CreateRigController {
  export type Response = Rig;
}
