import { Controller } from "@application/contracts/Controller";
import { ListRigItem } from "@application/queries/types/ListRigItem";
import { ListRigsUseCase } from "@application/useCases/rigs/ListRigsUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import {
  ListRigQuery,
  listRigQuerySchema,
} from "./schemas/listRigQuerySchema";

@Injectable()
export class ListRigsController extends Controller<
  "private",
  ListRigsController.Response
> {
  constructor(private readonly listRigsUseCase: ListRigsUseCase) {
    super();
  }

  protected override async handle({
    queryParams,
  }: Controller.Request<
    "private",
    Record<string, never>,
    Record<string, never>,
    ListRigQuery
  >): Promise<Controller.Response<ListRigsController.Response>> {
    const filters = listRigQuerySchema.parse(queryParams ?? {});

    const { hasNext, items, page, pageSize, total } =
      await this.listRigsUseCase.execute(filters);

    return {
      statusCode: 200,
      body: { hasNext, items, page, pageSize, total },
    };
  }
}

export namespace ListRigsController {
  export type Response = {
    items: ListRigItem[];
    total: number;
    page: string | undefined;
    pageSize: number;
    hasNext: boolean;
  };
}
