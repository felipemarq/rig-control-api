import { Controller } from "@application/contracts/Controller";
import { EfficiencyDay } from "@application/entities/EfficiencyDay";
import { CreateEfficiencyDayUseCase } from "@application/useCases/efficiency/CreateEfficiencyDayUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import {
  CreateEfficiencyDayBody,
  createEfficiencyDaySchema,
} from "./schemas/createEfficiencyDaySchema";

@Injectable()
@Schema(createEfficiencyDaySchema)
export class CreateEfficiencyDayController extends Controller<
  "private",
  CreateEfficiencyDayController.Response
> {
  constructor(
    private readonly createEfficiencyDayUseCase: CreateEfficiencyDayUseCase
  ) {
    super();
  }

  protected override async handle({
    body,
  }: Controller.Request<"private", CreateEfficiencyDayBody>): Promise<
    Controller.Response<CreateEfficiencyDayController.Response>
  > {
    const confirmedAt =
      body.confirmedAt === undefined
        ? undefined
        : body.confirmedAt === null
          ? null
          : body.confirmedAt;

    const confirmedByUserId =
      body.confirmedByUserId === undefined
        ? undefined
        : body.confirmedByUserId === null
          ? null
          : body.confirmedByUserId;

    const efficiencyDay = await this.createEfficiencyDayUseCase.execute({
      rigId: body.rigId,
      localDate: body.localDate,
      status: body.status,
      totals: body.totals ?? null,
      confirmedAt,
      confirmedByUserId,
    });

    return {
      statusCode: 201,
      body: efficiencyDay,
    };
  }
}

export namespace CreateEfficiencyDayController {
  export type Response = EfficiencyDay;
}
