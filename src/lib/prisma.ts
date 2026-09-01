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
  if (!globalThis.prisma || !(globalThis.prisma as any).projectTask) {
    globalThis.prisma = createPrismaClient();
  }
  return globalThis.prisma;
}

// Proxy exported as `db` so `db.transaction` or any model property always dynamically resolves to the latest fresh instance
export const db = new Proxy({} as any, {
  get(_target, prop) {
    const clientInstance = getDb();
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
};
