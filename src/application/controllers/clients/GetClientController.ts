import { Controller } from "@application/contracts/Controller";
import { Client } from "@application/entities/Client";
import { GetClientUseCase } from "@application/useCases/clients/GetClientUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { updateClientParamsSchema } from "./schemas/updateClientParamsSchema";

@Injectable()
export class GetClientController extends Controller<
  "private",
  GetClientController.Response
> {
  constructor(private readonly getClientUseCase: GetClientUseCase) {
    super();
  }

  protected override async handle({
    params,
  }: Controller.Request<
    "private",
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >): Promise<Controller.Response<GetClientController.Response>> {
    const { clientId } = updateClientParamsSchema.parse(params ?? {});

    const client = await this.getClientUseCase.execute({ clientId });

    return {
      statusCode: 200,
      body: client,
    };
  }
}

export namespace GetClientController {
  export type Response = Client;
}
