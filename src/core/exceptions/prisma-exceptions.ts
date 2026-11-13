import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "../../generated/prisma/internal/prismaNamespace.js";

export function prismaException(error: unknown):never {
  if (error instanceof (PrismaClientKnownRequestError)) {
    switch (error.code) {
      case "P2025":
        throw new NotFoundException("Resource not found");

      case "P2002":
        throw new ConflictException("Resource already exists");

      case "P2003":
        throw new BadRequestException("Foreign key constraint failed");

      default:
        throw error;
    }
  }
  throw error
}
