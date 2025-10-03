import { Controller } from "@application/contracts/Controller";
import { ListContractUseCase } from "@application/useCases/contracts/ListContractUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import {
  ListContractQuery,
  listContractQuerySchema,
} from "./schemas/listContractQuerySchema";
import { ListContractItem } from "@application/queries/types/ListTransactionItem";

@Injectable()
export class ListContractController extends Controller<
  "private",
  ListContractController.Response
> {
  constructor(private readonly listContractUseCase: ListContractUseCase) {
    super();
  }

  protected override async handle({
    userId,
    body,
    params,
    queryParams,
  }: Controller.Request<
    "private",
    Record<string, any>,
    Record<string, any>,
    ListContractQuery
  >): Promise<Controller.Response<ListContractController.Response>> {
    const listContractFilters = listContractQuerySchema.parse(
      queryParams ?? {}
    );

    const { hasNext, items, total, page, pageSize } =
      await this.listContractUseCase.execute({
        ...listContractFilters,
      });

    return {
      statusCode: 200,
      body: { hasNext, items, total, page, pageSize },
    };
  }
}

export namespace ListContractController {
  export type Response = {
    items: ListContractItem[]; // <<< agora vem com refs
    total: number;
    page: string | undefined;
    pageSize: number;
    hasNext: boolean;
  };
}
