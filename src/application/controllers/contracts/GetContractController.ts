import { Controller } from "@application/contracts/Controller";
import { ListContractItem } from "@application/queries/types/ListTransactionItem";
import { GetContractUseCase } from "@application/useCases/contracts/GetContractUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { updateContractParamsSchema } from "./schemas/updateContractParamsSchema";

@Injectable()
export class GetContractController extends Controller<
  "private",
  ListContractItem
> {
  constructor(private readonly getContractUseCase: GetContractUseCase) {
    super();
  }

  protected override async handle({
    params,
  }: Controller.Request<
    "private",
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >): Promise<Controller.Response<ListContractItem>> {
    const { contractId } = updateContractParamsSchema.parse(params ?? {});

    const contract = await this.getContractUseCase.execute({ contractId });

    return {
      statusCode: 200,
      body: contract,
    };
  }
}
