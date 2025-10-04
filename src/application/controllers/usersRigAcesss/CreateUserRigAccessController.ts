import { Controller } from "@application/contracts/Controller";
import { UserRigAccess } from "@application/entities/UserRigAcess";
import { CreateUserRigAccessUseCase } from "@application/useCases/userRigAccess/CreateUserRigAccessUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import {
  CreateUserRigAccessBody,
  createUserRigAccessSchema,
} from "./schema/userRigAccessSchemas";

@Injectable()
@Schema(createUserRigAccessSchema)
export class CreateUserRigAccessController extends Controller<
  "private",
  UserRigAccess
> {
  constructor(
    private readonly createUserRigAccessUseCase: CreateUserRigAccessUseCase
  ) {
    super();
  }

  protected override async handle({
    userId,
    body,
  }: Controller.Request<
    "private",
    CreateUserRigAccessBody
  >): Promise<Controller.Response<UserRigAccess>> {
    const access = await this.createUserRigAccessUseCase.execute(userId, body);

    return {
      statusCode: 200,
      body: access,
    };
  }
}
