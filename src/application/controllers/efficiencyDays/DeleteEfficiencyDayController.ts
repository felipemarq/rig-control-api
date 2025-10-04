import { Controller } from "@application/contracts/Controller";
import { Injectable } from "@kernel/decorators/Injectable";
import { DeleteEfficiencyDayUseCase } from "@application/useCases/efficiencyDays/DeleteEfficiencyDayUseCase";
import { efficiencyDayParamsSchema } from "./schemas/efficiencyDayParamsSchema";

@Injectable()
export class DeleteEfficiencyDayController extends Controller<
  "private",
  void
> {
  constructor(
    private readonly deleteEfficiencyDayUseCase: DeleteEfficiencyDayUseCase
  ) {
    super();
  }

  protected override async handle({
    userId,
    params,
  }: Controller.Request<
    "private",
    Record<string, never>,
    { rigId: string; localDate: string },
    Record<string, never>
  >): Promise<Controller.Response<void>> {
    const { rigId, localDate } = efficiencyDayParamsSchema.parse(params ?? {});

    await this.deleteEfficiencyDayUseCase.execute(userId, { rigId, localDate });

    return {
      statusCode: 204,
      body: undefined,
    };
  }
}
