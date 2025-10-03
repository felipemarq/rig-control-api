import { Controller } from "@application/contracts/Controller";
import { Injectable } from "@kernel/decorators/Injectable";
import { Client } from "@application/entities/Client";
import { CreateClientUseCase } from "@application/useCases/clients/CreateClientUseCase";
import { CreateContractBody } from "./schemas/createContractSchema";
import { CreateContractUseCase } from "@application/useCases/contracts/CreateContractUseCase";
import { Contract } from "@application/entities/Contract";

@Injectable()
export class CreateContractController extends Controller<
  "private",
  CreateContractController.Response
> {
  constructor(private readonly createContractUseCase: CreateContractUseCase) {
    super();
  }

  protected override async handle({
    userId,
    body,
  }: Controller.Request<"private", CreateContractBody>): Promise<
    Controller.Response<CreateContractController.Response>
  > {
    const { clientId, code, startAt, status, endAt } = body;
    const contract = await this.createContractUseCase.execute({
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

export namespace CreateContractController {
  export type Response = Contract;
}
