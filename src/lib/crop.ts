import type { NormRect } from "@/hooks/useCropRects";

export async function cropImageFromSrc(
  src: string,
  rect: NormRect
): Promise<{ url: string; width: number; height: number }> {
  const img = await loadImage(src);
  const sx = Math.round(rect.x * img.naturalWidth);
  const sy = Math.round(rect.y * img.naturalHeight);
  const sw = Math.round(rect.w * img.naturalWidth);
  const sh = Math.round(rect.h * img.naturalHeight);

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context not available");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error("Canvas toBlob failed"))), "image/jpeg", 0.92)
  );
  const url = URL.createObjectURL(blob);
  return { url, width: sw, height: sh };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
