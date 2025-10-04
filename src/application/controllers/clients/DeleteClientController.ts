import { Controller } from "@application/contracts/Controller";
import { DeleteClientUseCase } from "@application/useCases/clients/DeleteClientUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { updateClientParamsSchema } from "./schemas/updateClientParamsSchema";

@Injectable()
export class DeleteClientController extends Controller<
  "private",
  void
> {
  constructor(private readonly deleteClientUseCase: DeleteClientUseCase) {
    super();
  }

  protected override async handle({
    params,
  }: Controller.Request<
    "private",
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >): Promise<Controller.Response<void>> {
    const { clientId } = updateClientParamsSchema.parse(params ?? {});

    await this.deleteClientUseCase.execute({ clientId });

    return {
      statusCode: 204,
    };
  }
}
