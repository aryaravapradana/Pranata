import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(
        supabaseUrl,
        supabaseAnonKey,
      )
    : null;

/**
 * Compresses an image file using an offscreen HTML5 canvas to WebP format.
 */
export function compressImage(
  file: File,
  maxPx = 800,
  quality = 0.82,
): Promise<Blob & { dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(
        new Error("Failed to read file"),
      );
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () =>
        reject(
          new Error("Failed to load image"),
        );
      img.onload = () => {
        const canvas =
          document.createElement("canvas");
        const ratio = Math.min(
          maxPx / img.width,
          maxPx / img.height,
          1,
        );
        canvas.width = Math.round(
          img.width * ratio,
        );
        canvas.height = Math.round(
          img.height * ratio,
        );
        const ctx = canvas.getContext("2d");
        if (!ctx)
          return reject(
            new Error(
              "Canvas context unavailable",
            ),
          );
        ctx.drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const dataUrl = canvas.toDataURL(
          "image/webp",
          quality,
        );
        canvas.toBlob(
          (blob) => {
            if (blob) {
              Object.assign(blob, {
                dataUrl,
              });
              resolve(
                blob as Blob & {
                  dataUrl: string;
                },
              );
            } else {
              reject(
                new Error(
                  "Blob conversion failed",
                ),
              );
            }
          },
          "image/webp",
          quality,
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Supabase Storage CDN, or falls back to WebP Base64 string if Supabase keys are absent.
 */
export async function uploadImage(
  file: File,
  bucket = "avatars",
  maxPx = 800,
): Promise<string> {
  try {
    const compressedBlob =
      await compressImage(file, maxPx, 0.85);

    if (supabase) {
      const ext = "webp";
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const filePath = `${fileName}`;

      const { error } =
        await supabase.storage
          .from(bucket)
          .upload(filePath, compressedBlob, {
            contentType: "image/webp",
            upsert: true,
          });

      if (!error) {
        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      }
    }

    // Fallback to optimized compressed Base64 WebP string
    return compressedBlob.dataUrl;
  } catch (err) {
    console.warn(
      "Image compression/upload warning, fallback to raw reader:",
      err,
    );
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }
}
