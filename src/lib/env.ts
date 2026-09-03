import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_APP_NAME: z.string().default("ABCD Agency"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Resend Email
  DEVELOPER_EMAIL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SMTP_FROM: z.string().default("ABCD Agency <onboarding@resend.dev>"),

  // Auth Secret
  AUTH_SECRET: z.string().default("abcd-agency-secure-signing-secret-fallback-key-2026"),

  // Google OAuth (Optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  DEVELOPER_EMAIL: process.env.DEVELOPER_EMAIL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SMTP_FROM: process.env.SMTP_FROM,
  AUTH_SECRET: process.env.AUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
});
