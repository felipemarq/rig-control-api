import { Controller } from "@application/contracts/Controller";

import { Injectable } from "@kernel/decorators/Injectable";
import { CreateClientBody } from "./schemas/createClientSchema";
import { Client } from "@application/entities/Client";
import { CreateClientUseCase } from "@application/useCases/clients/CreateClientUseCase";

@Injectable()
export class CreateClientController extends Controller<
  "private",
  CreateClientController.Response
> {
  constructor(private readonly createClientUseCase: CreateClientUseCase) {
    super();
  }

  protected override async handle({
    userId,
    body,
  }: Controller.Request<"private", CreateClientBody>): Promise<
    Controller.Response<CreateClientController.Response>
  > {
    const { name, taxId } = body;
    const client = await this.createClientUseCase.execute({ name, taxId });

    return {
      statusCode: 200,
      body: client,
    };
  }
}

export namespace CreateClientController {
  export type Response = Client;
}
