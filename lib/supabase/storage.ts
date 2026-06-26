import { createId } from "@paralleldrive/cuid2";

import { createClient } from "@/lib/supabase/server";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const PLATFORM_IMAGES_BUCKET = "platform-images";

const EXT_BY_TYPE: Record<(typeof ALLOWED_IMAGE_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type PlatformImageFolder = "avatars" | "feed" | "community";

export class StorageError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new StorageError(
      "VALIDATION_ERROR",
      "Unsupported file format. Use JPEG, PNG, or WebP",
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new StorageError("VALIDATION_ERROR", "File too large. Max 5MB");
  }
}

export async function uploadPlatformImage(
  userId: string,
  folder: PlatformImageFolder,
  file: File,
): Promise<string> {
  validateImageFile(file);

  const supabase = await createClient();
  const ext = EXT_BY_TYPE[file.type as (typeof ALLOWED_IMAGE_TYPES)[number]];
  const path = `${folder}/${userId}/${createId()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(PLATFORM_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new StorageError(
      "UPLOAD_FAILED",
      error.message || "Failed to upload image",
    );
  }

  const { data } = supabase.storage
    .from(PLATFORM_IMAGES_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
