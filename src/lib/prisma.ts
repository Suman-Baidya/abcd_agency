import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Required for compatibility with certain environments
neonConfig.webSocketConstructor = ws;

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
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
    !(globalThis.prisma as any).blogCategory ||
    !(globalThis.prisma as any).projectAgreement
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

function createProjectAgreementFallbackDelegate(clientInstance: any) {
  return {
    findMany: async (args?: any) => {
      if (args?.where?.projectId?.in) {
        return await clientInstance.$queryRawUnsafe(
          `SELECT * FROM "ProjectAgreement" WHERE "projectId" = ANY($1::text[]);`,
          args.where.projectId.in
        );
      }
      return await clientInstance.$queryRawUnsafe(`SELECT * FROM "ProjectAgreement";`);
    },
    findUnique: async ({ where }: any) => {
      if (where.id) {
        const rows: any = await clientInstance.$queryRawUnsafe(
          `SELECT * FROM "ProjectAgreement" WHERE "id" = $1 LIMIT 1;`,
          where.id
        );
        return rows[0] || null;
      }
      if (where.projectId) {
        const rows: any = await clientInstance.$queryRawUnsafe(
          `SELECT * FROM "ProjectAgreement" WHERE "projectId" = $1 LIMIT 1;`,
          where.projectId
        );
        return rows[0] || null;
      }
      if (where.agreementNumber) {
        const rows: any = await clientInstance.$queryRawUnsafe(
          `SELECT * FROM "ProjectAgreement" WHERE "agreementNumber" = $1 LIMIT 1;`,
          where.agreementNumber
        );
        return rows[0] || null;
      }
      return null;
    },
    create: async ({ data }: any) => {
      const id = 'agr_' + Math.random().toString(36).substring(2, 10);
      const now = new Date();
      const rows: any = await clientInstance.$queryRawUnsafe(
        `INSERT INTO "ProjectAgreement" (
          "id", "projectId", "agreementNumber", "status", "startDate", "deliveryDate", "estimatedDuration",
          "totalAmountRaw", "advancePercent", "advanceAmountRaw", "deliveryPercent", "deliveryAmountRaw",
          "finalPercent", "finalAmountRaw", "paymentDueDays", "reviewWindowDays", "revisionRounds",
          "termsAndPolicy", "notes", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING *;`,
        id, data.projectId, data.agreementNumber, data.status || "Active",
        data.startDate || null, data.deliveryDate || null, data.estimatedDuration || null,
        data.totalAmountRaw || 0, data.advancePercent || 40, data.advanceAmountRaw || 0,
        data.deliveryPercent || 40, data.deliveryAmountRaw || 0,
        data.finalPercent || 20, data.finalAmountRaw || 0,
        data.paymentDueDays || 7, data.reviewWindowDays || 14, data.revisionRounds || 2,
        data.termsAndPolicy || "", data.notes || null, now, now
      );
      return rows[0];
    },
    upsert: async ({ where, create, update }: any) => {
      const existing: any = await clientInstance.$queryRawUnsafe(
        `SELECT * FROM "ProjectAgreement" WHERE "projectId" = $1 LIMIT 1;`,
        where.projectId
      );
      if (existing && existing.length > 0) {
        const prev = existing[0];
        const now = new Date();
        const agreementNumber = update.agreementNumber || prev.agreementNumber;
        const status = update.status || prev.status || "Active";
        const startDate = update.startDate !== undefined ? update.startDate : prev.startDate;
        const deliveryDate = update.deliveryDate !== undefined ? update.deliveryDate : prev.deliveryDate;
        const estimatedDuration = update.estimatedDuration !== undefined ? update.estimatedDuration : prev.estimatedDuration;
        const totalAmountRaw = update.totalAmountRaw !== undefined ? update.totalAmountRaw : prev.totalAmountRaw;
        const advancePercent = update.advancePercent !== undefined ? update.advancePercent : prev.advancePercent;
        const advanceAmountRaw = update.advanceAmountRaw !== undefined ? update.advanceAmountRaw : prev.advanceAmountRaw;
        const deliveryPercent = update.deliveryPercent !== undefined ? update.deliveryPercent : prev.deliveryPercent;
        const deliveryAmountRaw = update.deliveryAmountRaw !== undefined ? update.deliveryAmountRaw : prev.deliveryAmountRaw;
        const finalPercent = update.finalPercent !== undefined ? update.finalPercent : prev.finalPercent;
        const finalAmountRaw = update.finalAmountRaw !== undefined ? update.finalAmountRaw : prev.finalAmountRaw;
        const paymentDueDays = update.paymentDueDays !== undefined ? update.paymentDueDays : prev.paymentDueDays;
        const reviewWindowDays = update.reviewWindowDays !== undefined ? update.reviewWindowDays : prev.reviewWindowDays;
        const revisionRounds = update.revisionRounds !== undefined ? update.revisionRounds : prev.revisionRounds;
        const termsAndPolicy = update.termsAndPolicy !== undefined ? update.termsAndPolicy : prev.termsAndPolicy;
        const notes = update.notes !== undefined ? update.notes : prev.notes;
        const signedAt = update.signedAt !== undefined ? update.signedAt : prev.signedAt;
        const signedByName = update.signedByName !== undefined ? update.signedByName : prev.signedByName;
        const signedByEmail = update.signedByEmail !== undefined ? update.signedByEmail : prev.signedByEmail;
        const signedByTitle = update.signedByTitle !== undefined ? update.signedByTitle : prev.signedByTitle;
        const signedIp = update.signedIp !== undefined ? update.signedIp : prev.signedIp;
        const signedUserAgent = update.signedUserAgent !== undefined ? update.signedUserAgent : prev.signedUserAgent;
        const signatureType = update.signatureType !== undefined ? update.signatureType : prev.signatureType;
        const clientSignature = update.clientSignature !== undefined ? update.clientSignature : prev.clientSignature;
        const contractorSignedAt = update.contractorSignedAt !== undefined ? update.contractorSignedAt : prev.contractorSignedAt;
        const contractorSignature = update.contractorSignature !== undefined ? update.contractorSignature : prev.contractorSignature;
        const signedAuditHash = update.signedAuditHash !== undefined ? update.signedAuditHash : prev.signedAuditHash;
        const originalSignedAt = update.originalSignedAt !== undefined ? update.originalSignedAt : prev.originalSignedAt;
        const originalSignedIp = update.originalSignedIp !== undefined ? update.originalSignedIp : prev.originalSignedIp;
        const originalAuditHash = update.originalAuditHash !== undefined ? update.originalAuditHash : prev.originalAuditHash;
        const confirmationHistory = update.confirmationHistory !== undefined ? update.confirmationHistory : prev.confirmationHistory;

        const rows: any = await clientInstance.$queryRawUnsafe(
          `UPDATE "ProjectAgreement" SET 
            "agreementNumber" = $1, "status" = $2,
            "startDate" = $3, "deliveryDate" = $4, "estimatedDuration" = $5,
            "totalAmountRaw" = $6, "advancePercent" = $7, "advanceAmountRaw" = $8,
            "deliveryPercent" = $9, "deliveryAmountRaw" = $10, "finalPercent" = $11,
            "finalAmountRaw" = $12, "paymentDueDays" = $13, "reviewWindowDays" = $14,
            "revisionRounds" = $15, "termsAndPolicy" = $16, "notes" = $17,
            "signedAt" = $18, "signedByName" = $19, "signedByEmail" = $20, "signedByTitle" = $21,
            "signedIp" = $22, "signedUserAgent" = $23, "signatureType" = $24, "clientSignature" = $25,
            "contractorSignedAt" = $26, "contractorSignature" = $27, "signedAuditHash" = $28,
            "originalSignedAt" = $29, "originalSignedIp" = $30, "originalAuditHash" = $31, "confirmationHistory" = $32,
            "updatedAt" = $33
           WHERE "projectId" = $34 RETURNING *;`,
          agreementNumber, status,
          startDate, deliveryDate, estimatedDuration,
          totalAmountRaw, advancePercent, advanceAmountRaw,
          deliveryPercent, deliveryAmountRaw, finalPercent,
          finalAmountRaw, paymentDueDays, reviewWindowDays,
          revisionRounds, termsAndPolicy, notes,
          signedAt, signedByName, signedByEmail, signedByTitle,
          signedIp, signedUserAgent, signatureType, clientSignature,
          contractorSignedAt, contractorSignature, signedAuditHash,
          originalSignedAt, originalSignedIp, originalAuditHash, confirmationHistory,
          now, where.projectId
        );
        return rows[0];
      }
      const id = 'agr_' + Math.random().toString(36).substring(2, 10);
      const now = new Date();
      const rows: any = await clientInstance.$queryRawUnsafe(
        `INSERT INTO "ProjectAgreement" (
          "id", "projectId", "agreementNumber", "status", "startDate", "deliveryDate", "estimatedDuration",
          "totalAmountRaw", "advancePercent", "advanceAmountRaw", "deliveryPercent", "deliveryAmountRaw",
          "finalPercent", "finalAmountRaw", "paymentDueDays", "reviewWindowDays", "revisionRounds",
          "termsAndPolicy", "notes",
          "signedAt", "signedByName", "signedByEmail", "signedByTitle",
          "signedIp", "signedUserAgent", "signatureType", "clientSignature",
          "contractorSignedAt", "contractorSignature", "signedAuditHash",
          "originalSignedAt", "originalSignedIp", "originalAuditHash", "confirmationHistory",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36
        ) RETURNING *;`,
        id, create.projectId, create.agreementNumber, create.status || "Active",
        create.startDate || null, create.deliveryDate || null, create.estimatedDuration || null,
        create.totalAmountRaw || 0, create.advancePercent || 40, create.advanceAmountRaw || 0,
        create.deliveryPercent || 40, create.deliveryAmountRaw || 0,
        create.finalPercent || 20, create.finalAmountRaw || 0,
        create.paymentDueDays || 7, create.reviewWindowDays || 14, create.revisionRounds || 2,
        create.termsAndPolicy || "", create.notes || null,
        create.signedAt || null, create.signedByName || null, create.signedByEmail || null, create.signedByTitle || null,
        create.signedIp || null, create.signedUserAgent || null, create.signatureType || "DRAW", create.clientSignature || null,
        create.contractorSignedAt || now, create.contractorSignature || null, create.signedAuditHash || null,
        create.originalSignedAt || null, create.originalSignedIp || null, create.originalAuditHash || null, create.confirmationHistory || null,
        now, now
      );
      return rows[0];
    },
    update: async ({ where, data }: any) => {
      const existing: any = await clientInstance.$queryRawUnsafe(
        `SELECT * FROM "ProjectAgreement" WHERE "projectId" = $1 OR "id" = $1 LIMIT 1;`,
        where.projectId || where.id
      );
      if (!existing || existing.length === 0) return null;
      const prev = existing[0];
      const now = new Date();
      const agreementNumber = data.agreementNumber !== undefined ? data.agreementNumber : prev.agreementNumber;
      const status = data.status !== undefined ? data.status : prev.status;
      const startDate = data.startDate !== undefined ? data.startDate : prev.startDate;
      const deliveryDate = data.deliveryDate !== undefined ? data.deliveryDate : prev.deliveryDate;
      const estimatedDuration = data.estimatedDuration !== undefined ? data.estimatedDuration : prev.estimatedDuration;
      const totalAmountRaw = data.totalAmountRaw !== undefined ? data.totalAmountRaw : prev.totalAmountRaw;
      const advancePercent = data.advancePercent !== undefined ? data.advancePercent : prev.advancePercent;
      const advanceAmountRaw = data.advanceAmountRaw !== undefined ? data.advanceAmountRaw : prev.advanceAmountRaw;
      const deliveryPercent = data.deliveryPercent !== undefined ? data.deliveryPercent : prev.deliveryPercent;
      const deliveryAmountRaw = data.deliveryAmountRaw !== undefined ? data.deliveryAmountRaw : prev.deliveryAmountRaw;
      const finalPercent = data.finalPercent !== undefined ? data.finalPercent : prev.finalPercent;
      const finalAmountRaw = data.finalAmountRaw !== undefined ? data.finalAmountRaw : prev.finalAmountRaw;
      const paymentDueDays = data.paymentDueDays !== undefined ? data.paymentDueDays : prev.paymentDueDays;
      const reviewWindowDays = data.reviewWindowDays !== undefined ? data.reviewWindowDays : prev.reviewWindowDays;
      const revisionRounds = data.revisionRounds !== undefined ? data.revisionRounds : prev.revisionRounds;
      const termsAndPolicy = data.termsAndPolicy !== undefined ? data.termsAndPolicy : prev.termsAndPolicy;
      const notes = data.notes !== undefined ? data.notes : prev.notes;
      const signedAt = data.signedAt !== undefined ? data.signedAt : prev.signedAt;
      const signedByName = data.signedByName !== undefined ? data.signedByName : prev.signedByName;
      const signedByEmail = data.signedByEmail !== undefined ? data.signedByEmail : prev.signedByEmail;
      const signedByTitle = data.signedByTitle !== undefined ? data.signedByTitle : prev.signedByTitle;
      const signedIp = data.signedIp !== undefined ? data.signedIp : prev.signedIp;
      const signedUserAgent = data.signedUserAgent !== undefined ? data.signedUserAgent : prev.signedUserAgent;
      const signatureType = data.signatureType !== undefined ? data.signatureType : prev.signatureType;
      const clientSignature = data.clientSignature !== undefined ? data.clientSignature : prev.clientSignature;
      const contractorSignedAt = data.contractorSignedAt !== undefined ? data.contractorSignedAt : prev.contractorSignedAt;
      const contractorSignature = data.contractorSignature !== undefined ? data.contractorSignature : prev.contractorSignature;
      const signedAuditHash = data.signedAuditHash !== undefined ? data.signedAuditHash : prev.signedAuditHash;
      const originalSignedAt = data.originalSignedAt !== undefined ? data.originalSignedAt : prev.originalSignedAt;
      const originalSignedIp = data.originalSignedIp !== undefined ? data.originalSignedIp : prev.originalSignedIp;
      const originalAuditHash = data.originalAuditHash !== undefined ? data.originalAuditHash : prev.originalAuditHash;
      const confirmationHistory = data.confirmationHistory !== undefined ? data.confirmationHistory : prev.confirmationHistory;

      const rows: any = await clientInstance.$queryRawUnsafe(
        `UPDATE "ProjectAgreement" SET 
          "agreementNumber" = $1, "status" = $2,
          "startDate" = $3, "deliveryDate" = $4, "estimatedDuration" = $5,
          "totalAmountRaw" = $6, "advancePercent" = $7, "advanceAmountRaw" = $8,
          "deliveryPercent" = $9, "deliveryAmountRaw" = $10, "finalPercent" = $11,
          "finalAmountRaw" = $12, "paymentDueDays" = $13, "reviewWindowDays" = $14,
          "revisionRounds" = $15, "termsAndPolicy" = $16, "notes" = $17,
          "signedAt" = $18, "signedByName" = $19, "signedByEmail" = $20, "signedByTitle" = $21,
          "signedIp" = $22, "signedUserAgent" = $23, "signatureType" = $24, "clientSignature" = $25,
          "contractorSignedAt" = $26, "contractorSignature" = $27, "signedAuditHash" = $28,
          "originalSignedAt" = $29, "originalSignedIp" = $30, "originalAuditHash" = $31, "confirmationHistory" = $32,
          "updatedAt" = $33
         WHERE "id" = $34 RETURNING *;`,
        agreementNumber, status,
        startDate, deliveryDate, estimatedDuration,
        totalAmountRaw, advancePercent, advanceAmountRaw,
        deliveryPercent, deliveryAmountRaw, finalPercent,
        finalAmountRaw, paymentDueDays, reviewWindowDays,
        revisionRounds, termsAndPolicy, notes,
        signedAt, signedByName, signedByEmail, signedByTitle,
        signedIp, signedUserAgent, signatureType, clientSignature,
        contractorSignedAt, contractorSignature, signedAuditHash,
        originalSignedAt, originalSignedIp, originalAuditHash, confirmationHistory,
        now, prev.id
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
    if (prop === "projectAgreement") {
      if ((clientInstance as any).projectAgreement) {
        return (clientInstance as any).projectAgreement;
      }
      return createProjectAgreementFallbackDelegate(clientInstance);
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
  projectAgreement: any;
};
