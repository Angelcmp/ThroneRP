import { ValidationError } from "../utils/errors.js";

export function validateBody(schema) {
  return async (request) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      throw new ValidationError(
        "Datos invalidos",
        result.error.flatten().fieldErrors,
      );
    }
    request.body = result.data;
  };
}
