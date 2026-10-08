import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logSecurityEvent } from "@/lib/security";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf"
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

export async function POST(request) {
  try {
    // 1. IP Rate Limiting (5 uploads per 10 minutes per IP)
    const clientIp = getClientIp(request);
    const limitCheck = await rateLimit(`support_upload_${clientIp}`, 5, 10 * 60 * 1000);
    if (!limitCheck.success) {
      logSecurityEvent("SUPPORT_UPLOAD_RATE_LIMIT_EXCEEDED", { ip: clientIp });
      return NextResponse.json(
        { error: "Too many upload attempts. Please wait 10 minutes before uploading another file." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No proof document file provided." }, { status: 400 });
    }

    // 2. File Size Check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 5 MB maximum limit." },
        { status: 400 }
      );
    }

    // 3. MIME Type & Extension Check
    const mimeType = (file.type || "").toLowerCase();
    const fileName = file.name || "";
    const extMatch = fileName.match(/\.[0-9a-z]+$/i);
    const ext = extMatch ? extMatch[0].toLowerCase() : "";

    if ((mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) || !ALLOWED_EXTENSIONS.has(ext)) {
      logSecurityEvent("INVALID_SUPPORT_PROOF_EXTENSION", { mimeType, ext, fileName });
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP images and PDF documents are permitted." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Upload to Cloudinary if configured
    if (isCloudinaryConfigured) {
      try {
        const result = await uploadToCloudinary(buffer, "ravtron_warranty_proofs");
        return NextResponse.json({
          success: true,
          url: result.secure_url,
          filename: fileName
        });
      } catch (cloudinaryError) {
        console.error("Cloudinary proof upload failed:", cloudinaryError);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { error: "Cloud proof storage upload failed. Please try again later." },
            { status: 500 }
          );
        }
      }
    }

    // 5. Local Storage Fallback (Dev / Staging)
    const uploadDir = path.join(process.cwd(), "public", "uploads", "warranty");
    await mkdir(uploadDir, { recursive: true });

    const safeBaseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFilename = `proof_${safeBaseName}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/warranty/${uniqueFilename}`,
      filename: fileName
    });
  } catch (error) {
    console.error("POST /api/upload/support-proof error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to process proof upload." : (error.message || "Failed to process proof upload.") },
      { status: 500 }
    );
  }
}
