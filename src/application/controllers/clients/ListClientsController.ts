import { Controller } from "@application/contracts/Controller";
import { ListClientsUseCase } from "@application/useCases/clients/ListClientsUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import {
  ListClientQuery,
  listClientQuerySchema,
} from "./schemas/listClientQuerySchema";
import { Client } from "@application/entities/Client";

@Injectable()
export class ListClientsController extends Controller<
  "private",
  ListClientsController.Response
> {
  constructor(private readonly listClientsUseCase: ListClientsUseCase) {
    super();
  }

  protected override async handle({
    queryParams,
  }: Controller.Request<
    "private",
    Record<string, never>,
    Record<string, never>,
    ListClientQuery
  >): Promise<Controller.Response<ListClientsController.Response>> {
    const filters = listClientQuerySchema.parse(queryParams ?? {});

    const { hasNext, items, page, pageSize, total } =
      await this.listClientsUseCase.execute(filters);

    return {
      statusCode: 200,
      body: { hasNext, items, page, pageSize, total },
    };
  }
}

export namespace ListClientsController {
  export type Response = {
    items: Client[];
    total: number;
    page: string | undefined;
    pageSize: number;
    hasNext: boolean;
  };
}
