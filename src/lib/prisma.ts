import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Required for compatibility with certain environments
neonConfig.webSocketConstructor = ws;

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

function createPrismaClient(): PrismaClient {
  let prismaArgs = {};
  if (connectionString) {
    // Prisma 7+ PrismaNeon adapter takes a config object rather than a Pool instance
    const adapter = new PrismaNeon({ connectionString });
    prismaArgs = { adapter };
  }

  return new PrismaClient({
    ...prismaArgs,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export function getDb(): PrismaClient {
  if (
    !globalThis.prisma ||
    !(globalThis.prisma as any).blogPost ||
    !(globalThis.prisma as any).blogCategory
  ) {
    globalThis.prisma = createPrismaClient();
  }
  return globalThis.prisma;
}

function createBlogCategoryFallbackDelegate(clientInstance: any) {
  return {
    findMany: async (_args?: any) => {
      return await clientInstance.$queryRawUnsafe(`SELECT * FROM "BlogCategory" ORDER BY "name" ASC;`);
    },
    findUnique: async ({ where }: any) => {
      if (where.id) {
        const rows: any = await clientInstance.$queryRawUnsafe(
          `SELECT * FROM "BlogCategory" WHERE "id" = $1 LIMIT 1;`,
          where.id
        );
        return rows[0] || null;
      }
      if (where.name) {
        const rows: any = await clientInstance.$queryRawUnsafe(
          `SELECT * FROM "BlogCategory" WHERE "name" = $1 LIMIT 1;`,
          where.name
        );
        return rows[0] || null;
      }
      return null;
    },
    create: async ({ data }: any) => {
      const id = 'cat_' + Math.random().toString(36).substring(2, 10);
      const now = new Date();
      const rows: any = await clientInstance.$queryRawUnsafe(
        `INSERT INTO "BlogCategory" ("id", "name", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4) RETURNING *;`,
        id,
        data.name,
        now,
        now
      );
      return rows[0];
    },
    update: async ({ where, data }: any) => {
      const now = new Date();
      const rows: any = await clientInstance.$queryRawUnsafe(
        `UPDATE "BlogCategory" SET "name" = $1, "updatedAt" = $2 WHERE "id" = $3 RETURNING *;`,
        data.name,
        now,
        where.id
      );
      return rows[0];
    },
    delete: async ({ where }: any) => {
      const rows: any = await clientInstance.$queryRawUnsafe(
        `DELETE FROM "BlogCategory" WHERE "id" = $1 RETURNING *;`,
        where.id
      );
      return rows[0];
    },
    upsert: async ({ where, create }: any) => {
      const existing: any = await clientInstance.$queryRawUnsafe(
        `SELECT * FROM "BlogCategory" WHERE "name" = $1 LIMIT 1;`,
        where.name
      );
      if (existing && existing.length > 0) return existing[0];
      const id = 'cat_' + Math.random().toString(36).substring(2, 10);
      const now = new Date();
      const rows: any = await clientInstance.$queryRawUnsafe(
        `INSERT INTO "BlogCategory" ("id", "name", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4) RETURNING *;`,
        id,
        create.name,
        now,
        now
      );
      return rows[0];
    },
  };
}

// Proxy exported as `db` so `db.transaction` or any model property always dynamically resolves to the latest fresh instance
export const db = new Proxy({} as any, {
  get(_target, prop) {
    let clientInstance = getDb();
    if (prop === "blogCategory") {
      if ((clientInstance as any).blogCategory) {
        return (clientInstance as any).blogCategory;
      }
      return createBlogCategoryFallbackDelegate(clientInstance);
    }
    if (typeof prop === "string" && prop !== "then" && !(clientInstance as any)[prop]) {
      globalThis.prisma = createPrismaClient();
      clientInstance = globalThis.prisma;
    }
    const value = (clientInstance as any)[prop];
    if (typeof value === "function") {
      return value.bind(clientInstance);
    }
    return value;
  },
}) as PrismaClient & {
  client: any;
  transaction: any;
  project: any;
  projectTask: any;
  inquiry: any;
  siteConfig: any;
  category: any;
  blogCategory: any;
  blogPost: any;
};
