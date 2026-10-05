import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyAdmin } from "@/lib/auth";
import { validateFileUpload, logSecurityEvent } from "@/lib/security";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    if (!(await verifyAdmin())) {
      logSecurityEvent("UNAUTHORIZED_UPLOAD_ATTEMPT");
      return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    const fileValidation = validateFileUpload(file);
    if (!fileValidation.valid) {
      logSecurityEvent("INVALID_FILE_UPLOAD", { error: fileValidation.error, fileName: file?.name });
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isProd = process.env.NODE_ENV === "production";

    // 1. Production Mode Check: Cloud storage mandatory in production
    if (isProd && !isCloudinaryConfigured) {
      return NextResponse.json(
        { error: "Cloud storage is mandatory in production, but Cloudinary is not configured." },
        { status: 500 }
      );
    }

    // 2. Cloudinary CDN Upload Path
    if (isCloudinaryConfigured) {
      try {
        const result = await uploadToCloudinary(buffer, "ravtron_products");
        return NextResponse.json({ url: result.secure_url, format: result.format, public_id: result.public_id });
      } catch (cloudinaryError) {
        console.error("Cloudinary CDN upload error:", cloudinaryError);
        if (isProd) {
          return NextResponse.json(
            { error: `Cloud storage upload failed: ${cloudinaryError.message || cloudinaryError}` },
            { status: 500 }
          );
        }
        console.warn("Falling back to local disk storage in development mode.");
      }
    }

    // 3. Fallback Local Storage Path (Development / Staging)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const fileExt = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${baseName}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${uniqueFilename}` });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to upload file" : (error.message || "Failed to upload file") },
      { status: 500 }
    );
  }
}
