import { Controller } from "@application/contracts/Controller";
import { EfficiencyDay } from "@application/entities/EfficiencyDay";
import { Injectable } from "@kernel/decorators/Injectable";
import { GetEfficiencyDayUseCase } from "@application/useCases/efficiencyDays/GetEfficiencyDayUseCase";
import { efficiencyDayParamsSchema } from "./schemas/efficiencyDayParamsSchema";

@Injectable()
export class GetEfficiencyDayController extends Controller<
  "private",
  EfficiencyDay
> {
  constructor(private readonly getEfficiencyDayUseCase: GetEfficiencyDayUseCase) {
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
  >): Promise<Controller.Response<EfficiencyDay>> {
    const { rigId, localDate } = efficiencyDayParamsSchema.parse(params ?? {});

    const efficiencyDay = await this.getEfficiencyDayUseCase.execute(userId, {
      rigId,
      localDate,
    });

    return {
      statusCode: 200,
      body: efficiencyDay,
    };
  }
}
