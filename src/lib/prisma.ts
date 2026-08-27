import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Required for compatibility with certain environments
neonConfig.webSocketConstructor = ws;

declare global {
    var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

let prismaArgs = {};
if (connectionString) {
    // Prisma 7+ PrismaNeon adapter takes a config object rather than a Pool instance
    const adapter = new PrismaNeon({ connectionString });
    prismaArgs = { adapter };
}

export const db =
    globalThis.prisma ||
    new PrismaClient({
        ...prismaArgs,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
