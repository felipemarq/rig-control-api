import { Controller } from "@application/contracts/Controller";
import { Injectable } from "@kernel/decorators/Injectable";
import { ListEfficiencyDaysUseCase } from "@application/useCases/efficiencyDays/ListEfficiencyDaysUseCase";
import { listEfficiencyDayQuerySchema } from "./schemas/listEfficiencyDayQuerySchema";
import { updateRigParamsSchema } from "@application/controllers/rigs/schemas/updateRigParamsSchema";

@Injectable()
export class ListEfficiencyDaysController extends Controller<
  "private",
  ListEfficiencyDaysController.Response
> {
  constructor(
    private readonly listEfficiencyDaysUseCase: ListEfficiencyDaysUseCase
  ) {
    super();
  }

  protected override async handle({
    userId,
    params,
    queryParams,
  }: Controller.Request<
    "private",
    Record<string, never>,
    { rigId: string },
    Record<string, unknown>
  >): Promise<Controller.Response<ListEfficiencyDaysController.Response>> {
    const { rigId } = updateRigParamsSchema.parse(params ?? {});

    const filters = listEfficiencyDayQuerySchema.parse(queryParams ?? {});

    const result = await this.listEfficiencyDaysUseCase.execute(userId, {
      rigId,
      query: filters,
    });

    return {
      statusCode: 200,
      body: result,
    };
  }
}

export namespace ListEfficiencyDaysController {
  export type Response = Awaited<
    ReturnType<ListEfficiencyDaysUseCase["execute"]>
  >;
}
