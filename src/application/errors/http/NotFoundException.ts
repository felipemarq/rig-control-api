import { ErrorCode } from "@application/errors/ErrorCode";
import { HttpError } from "./HttpError";

export class NotFoundException extends HttpError {
  readonly statusCode = 404;
  readonly code = ErrorCode.RESOURCE_NOT_FOUND;

  constructor(message = "Resource not found") {
    super(message);
  }
}
