import { PrismaClient } from "../../generated/prisma/index.js";

export class Prisma {
  #databasePath: string;
  #instance: PrismaClient;

  constructor(databasePath: string) {
    this.#databasePath = databasePath;
    this.#instance = new PrismaClient({
      datasources: {
        db: {
          url: `file:${this.#databasePath}`,
        },
      },
    });
  }

  get instance() {
    return this.#instance;
  }

  close() {
    return this.#instance.$disconnect();
  }

  [Symbol.asyncDispose]() {
    return this.close();
  }
}
