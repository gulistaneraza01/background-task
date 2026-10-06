import sharp from "sharp";

export const VARIANTS = [
  { label: "thumb", width: 150 },
  { label: "small", width: 320 },
  { label: "medium", width: 640 },
  { label: "large", width: 1280 },
] as const;

// Guards against decompression bombs (a tiny file that decodes to a huge bitmap).
const MAX_INPUT_PIXELS = 50_000_000;

// Never enlarge. An original narrower than the smallest size keeps one variant at its own width.
export function selectVariants(originalWidth: number): { label: string; width: number }[] {
  const fits = VARIANTS.filter((v) => v.width <= originalWidth);
  return fits.length ? [...fits] : [{ label: VARIANTS[0].label, width: originalWidth }];
}

export async function makeVariants(input: Buffer) {
  // sharp throws if the data is not a decodable raster image
  const meta = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  const { width, height } = meta.autoOrient ?? meta;
  if (!width || !height) throw new Error("Could not read image dimensions");

  const variants = await Promise.all(
    selectVariants(width).map(async ({ label, width: target }) => {
      // rotate() applies EXIF orientation; sharp drops EXIF (incl. GPS) from the output by default
      const { data, info } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
        .rotate()
        .resize({ width: target, withoutEnlargement: true })
        .webp()
        .toBuffer({ resolveWithObject: true });
      return { label, width: info.width, height: info.height, size: info.size, buffer: data };
    }),
  );
  return { width, height, variants };
}
