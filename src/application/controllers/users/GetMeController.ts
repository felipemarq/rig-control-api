import { Controller } from "@application/contracts/Controller";
import { User } from "@application/entities/User";
//import { GetMeQuery } from "@application/queries/GetMeQuery";

import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class GetMeController extends Controller<
  "public",
  GetMeController.Response
> {
  constructor(/* private readonly getMeQuery: GetMeQuery */) {
    super();
  }

  protected override async handle({
    userId,
  }: Controller.Request<"public">): Promise<
    Controller.Response<GetMeController.Response>
  > {
    //const { entities, user } = await this.getMeQuery.execute({ userId });

    return {
      statusCode: 200,
      body: {
        email: "felipe@moneystack.com.br",
        name: "Felipe",
        externalId: "123456789",
      },
    };
  }
}

export namespace GetMeController {
  export type Response = User;
}
