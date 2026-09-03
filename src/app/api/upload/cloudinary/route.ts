import { NextRequest, NextResponse } from "next/server";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { getCurrentUser, logUserActivity } from "@/lib/auth-session";
import { uploadLimiter, getClientIp } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
]);

const ALLOWED_FOLDERS = new Set([
  "abcd_agency/branding",
  "abcd_agency/projects",
  "abcd_agency/documents",
  "abcd_agency/clients",
]);

export async function POST(req: NextRequest) {
  try {
    // 1. Session & authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to upload files." },
        { status: 401 }
      );
    }

    // 2. Upload rate limiting (Max 10 uploads per 10 minutes)
    const clientIp = await getClientIp();
    const rateLimitKey = `${clientIp}:${user.id}`;
    const limitStatus = uploadLimiter.record(rateLimitKey);

    if (!limitStatus.allowed) {
      const mins = Math.ceil(limitStatus.retryAfterSeconds / 60);
      return NextResponse.json(
        { error: `Upload limit reached. Please wait ${mins} minute${mins > 1 ? "s" : ""} before uploading again.` },
        { status: 429 }
      );
    }

    // 3. Extract and validate multipart payload
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "abcd_agency/branding";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 4. File size check (5 MB cap)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 5MB size limit. Please choose a smaller file." },
        { status: 400 }
      );
    }

    // 5. File type check (MIME whitelist)
    const fileType = file.type ? file.type.toLowerCase() : "";
    if (!ALLOWED_MIME_TYPES.has(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, SVG, GIF images and PDFs are permitted." },
        { status: 400 }
      );
    }

    // 6. Folder path sanitization
    const targetFolder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : "abcd_agency/branding";

    // 7. Execute signed upload to Cloudinary
    const secureUrl = await uploadFileToCloudinary(file, targetFolder);

    // 8. Log user upload activity
    await logUserActivity(
      user.id,
      "FILE_UPLOADED",
      `Uploaded file "${file.name}" (${Math.round(file.size / 1024)} KB) to ${targetFolder}`
    ).catch(() => {});

    return NextResponse.json({ secure_url: secureUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
