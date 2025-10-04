import { Controller } from "@application/contracts/Controller";
import { DeleteRigUseCase } from "@application/useCases/rigs/DeleteRigUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { updateRigParamsSchema } from "./schemas/updateRigParamsSchema";

@Injectable()
export class DeleteRigController extends Controller<"private", void> {
  constructor(private readonly deleteRigUseCase: DeleteRigUseCase) {
    super();
  }

  protected override async handle({
    userId,
    params,
  }: Controller.Request<
    "private",
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >): Promise<Controller.Response<void>> {
    const { rigId } = updateRigParamsSchema.parse(params ?? {});

    await this.deleteRigUseCase.execute(userId, { rigId });

    return {
      statusCode: 204,
    };
  }
}
