import { AppError } from "../utils/errors.js";

export default function errorHandler(error, request, reply) {
  request.log.error({ err: error }, "Request error");

  if (error.isAppError || error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      message: "Datos invalidos",
      details: error.validation,
    });
  }

  if (error.name === "ValidationError" && error.errors) {
    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      message: "Datos invalidos",
      details: Object.fromEntries(
        Object.entries(error.errors).map(([k, v]) => [k, v.message]),
      ),
    });
  }

  if (error.name === "CastError") {
    return reply.status(400).send({
      error: "INVALID_ID",
      message: `ID invalido: ${error.value}`,
    });
  }

  const statusCode = error.statusCode || 500;
  return reply.status(statusCode).send({
    error: "INTERNAL_ERROR",
    message: statusCode === 500 ? "Error interno del servidor" : error.message,
  });
}
