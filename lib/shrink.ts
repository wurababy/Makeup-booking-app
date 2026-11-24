/* Shrinks a photo in the browser before upload (keeps uploads small and removes hidden location data). */
export async function shrink(file: File, maxPx = 1400): Promise<File> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, maxPx / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob: Blob = await new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no()), "image/jpeg", 0.85));
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}
