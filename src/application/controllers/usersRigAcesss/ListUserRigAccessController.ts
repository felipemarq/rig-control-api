import { Controller } from "@application/contracts/Controller";
import { ListUserRigAccessUseCase } from "@application/useCases/userRigAccess/ListUserRigAccessUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import {
  ListUserRigAccessQuery,
  listUserRigAccessQuerySchema,
} from "./schema/userRigAccessSchemas";
import { ListUserRigAccessItem } from "@application/queries/types/UserRigAccessItems";

@Injectable()
export class ListUserRigAccessController extends Controller<
  "private",
  ListUserRigAccessController.Response
> {
  constructor(
    private readonly listUserRigAccessUseCase: ListUserRigAccessUseCase
  ) {
    super();
  }

  protected override async handle({
    queryParams,
  }: Controller.Request<
    "private",
    Record<string, never>,
    Record<string, never>,
    ListUserRigAccessQuery
  >): Promise<Controller.Response<ListUserRigAccessController.Response>> {
    const filters = listUserRigAccessQuerySchema.parse(queryParams ?? {});

    const { hasNext, items, page, pageSize, total } =
      await this.listUserRigAccessUseCase.execute(filters);

    return {
      statusCode: 200,
      body: { hasNext, items, page, pageSize, total },
    };
  }
}

export namespace ListUserRigAccessController {
  export type Response = {
    items: ListUserRigAccessItem[];
    total: number;
    page: string | undefined;
    pageSize: number;
    hasNext: boolean;
  };
}
