import { prismaException } from "../exceptions/prisma-exceptions.js"

export async function prismaHandler<T>(operation: Promise<T>,):Promise<T> {
  try {
    return await operation
  }
  catch (err) {
    prismaException(err)
  }
}
