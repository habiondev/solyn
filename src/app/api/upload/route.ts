import { NextResponse } from "next/server";
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { supabaseAdmin, SUPABASE_BUCKET } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * POST /api/upload
 *
 * Загружает изображение в Supabase Storage (если сконфигурировано)
 * или в локальную папку public/uploads/ (fallback для dev).
 *
 * На вход: FormData с полем "file".
 * На выход: { ok, url } — публичный URL изображения.
 *
 * На Supabase Storage бакет должен быть публичным (см. DEPLOY.md).
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Только изображения" }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "Максимум 20 МБ" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const hash = crypto.randomBytes(8).toString("hex");
  const isPng = file.type === "image/png";
  const ext = isPng ? "png" : "webp";

  // Конвертируем в оптимизированный webp/png
  let optimized: Buffer;
  try {
    const img = sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true });
    if (isPng) {
      optimized = await img.png({ quality: 88, compressionLevel: 9 }).toBuffer();
    } else {
      optimized = await img.webp({ quality: 88 }).toBuffer();
    }
  } catch {
    optimized = buf;
  }

  // 1) Supabase Storage — приоритет в продакшене
  const sb = supabaseAdmin();
  if (sb) {
    const objectPath = `${hash}.${ext}`;
    const { error } = await sb.storage
      .from(SUPABASE_BUCKET)
      .upload(objectPath, optimized, {
        contentType: isPng ? "image/png" : "image/webp",
        cacheControl: "31536000", // 1 год
        upsert: false,
      });

    if (error) {
      console.error("[upload] supabase error:", error);
      return NextResponse.json(
        { error: `Storage error: ${error.message}` },
        { status: 500 },
      );
    }

    const { data: pub } = sb.storage.from(SUPABASE_BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({ ok: true, url: pub.publicUrl });
  }

  // 2) Локальная папка — для dev
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const out = path.join(dir, `${hash}.${ext}`);
  await writeFile(out, optimized);
  return NextResponse.json({ ok: true, url: `/uploads/${path.basename(out)}` });
}
