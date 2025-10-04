import { Controller } from "@application/contracts/Controller";
import { UpdateRigUseCase } from "@application/useCases/rigs/UpdateRigUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { UpdateRigBody } from "./schemas/updateRigSchema";
import { UpdateRigParams } from "./schemas/updateRigParamsSchema";
import { Rig } from "@application/entities/Rig";

@Injectable()
export class UpdateRigController extends Controller<
  "private",
  UpdateRigController.Response
> {
  constructor(private readonly updateRigUSeCase: UpdateRigUseCase) {
    super();
  }

  protected override async handle({
    userId,
    body,
    params,
  }: Controller.Request<"private", UpdateRigBody, UpdateRigParams>): Promise<
    Controller.Response<UpdateRigController.Response>
  > {
    const { rigId } = params;
    const { clientId, isActive, name, timezone, uf, baseId, contractId } = body;
    const rig = await this.updateRigUSeCase.execute(userId, {
      rigId,
      clientId,
      isActive,
      name,
      timezone,
      uf,
      baseId,
      contractId,
    });

    return {
      statusCode: 200,
      body: rig,
    };
  }
}

export namespace UpdateRigController {
  export type Response = Rig;
}
