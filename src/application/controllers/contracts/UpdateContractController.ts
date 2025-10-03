import { Controller } from "@application/contracts/Controller";
import { Injectable } from "@kernel/decorators/Injectable";
import { UpdateContractBody } from "./schemas/updateClientSchema";
import { UpdateContractParams } from "./schemas/updateContractParamsSchema";
import { Contract } from "@application/entities/Contract";
import { UpdateContractUseCase } from "@application/useCases/contracts/UpdateContractUseCase";

@Injectable()
export class UpdateContractController extends Controller<
  "private",
  UpdateContractController.Response
> {
  constructor(private readonly updateContractUseCase: UpdateContractUseCase) {
    super();
  }

  protected override async handle({
    userId,
    body,
    params,
  }: Controller.Request<
    "private",
    UpdateContractBody,
    UpdateContractParams
  >): Promise<Controller.Response<UpdateContractController.Response>> {
    const { contractId } = params;
    const { clientId, code, startAt, status, endAt } = body;
    const contract = await this.updateContractUseCase.execute({
      contractId,
      clientId,
      code,
      startAt,
      status,
      endAt: endAt ?? undefined,
    });

    return {
      statusCode: 200,
      body: contract,
    };
  }
}

export namespace UpdateContractController {
  export type Response = Contract;
}
