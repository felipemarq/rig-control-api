import { Controller } from "@application/contracts/Controller";

import { Injectable } from "@kernel/decorators/Injectable";
import { Client } from "@application/entities/Client";
import { CreateClientUseCase } from "@application/useCases/clients/CreateClientUseCase";
import { UpdateClientBody } from "./schemas/updateClientSchema";
import { UpdateClientParams } from "./schemas/updateClientParamsSchema";
import { UpdateClientUseCase } from "@application/useCases/clients/UpdateClientUseCase";

@Injectable()
export class UpdateClientController extends Controller<
  "private",
  UpdateClientController.Response
> {
  constructor(private readonly updateClientUseCase: UpdateClientUseCase) {
    super();
  }

  protected override async handle({
    userId,
    body,
    params,
  }: Controller.Request<
    "private",
    UpdateClientBody,
    UpdateClientParams
  >): Promise<Controller.Response<UpdateClientController.Response>> {
    const { clientId } = params;
    const { name, taxId } = body;
    const client = await this.updateClientUseCase.execute({
      clientId,
      name,
      taxId,
    });

    return {
      statusCode: 200,
      body: client,
    };
  }
}

export namespace UpdateClientController {
  export type Response = Client;
}
