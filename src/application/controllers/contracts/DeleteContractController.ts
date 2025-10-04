import { Controller } from "@application/contracts/Controller";
import { DeleteContractUseCase } from "@application/useCases/contracts/DeleteContractUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { updateContractParamsSchema } from "./schemas/updateContractParamsSchema";

@Injectable()
export class DeleteContractController extends Controller<"private", void> {
  constructor(private readonly deleteContractUseCase: DeleteContractUseCase) {
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
    const { contractId } = updateContractParamsSchema.parse(params ?? {});

    await this.deleteContractUseCase.execute({ contractId });

    return {
      statusCode: 204,
    };
  }
}
