import { Controller } from "@application/contracts/Controller";
import { ListRigItem } from "@application/queries/types/ListRigItem";
import { GetRigUseCase } from "@application/useCases/rigs/GetRigUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { updateRigParamsSchema } from "./schemas/updateRigParamsSchema";

@Injectable()
export class GetRigController extends Controller<
  "private",
  ListRigItem
> {
  constructor(private readonly getRigUseCase: GetRigUseCase) {
    super();
  }

  protected override async handle({
    params,
  }: Controller.Request<
    "private",
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >): Promise<Controller.Response<ListRigItem>> {
    const { rigId } = updateRigParamsSchema.parse(params ?? {});

    const rig = await this.getRigUseCase.execute({ rigId });

    return {
      statusCode: 200,
      body: rig,
    };
  }
}
