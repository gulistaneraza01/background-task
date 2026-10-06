import { expect, test } from "bun:test";
import sharp from "sharp";
import { makeVariants, selectVariants } from "./image-variants";

const png = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: "#336699" } }).png().toBuffer();

test("large original gets every size", () => {
  expect(selectVariants(4000).map((v) => v.label)).toEqual(["thumb", "small", "medium", "large"]);
});

test("never enlarges: 700px original skips the 1280 size", () => {
  expect(selectVariants(700).map((v) => v.width)).toEqual([150, 320, 640]);
});

test("original narrower than the smallest size keeps one variant at its own width", () => {
  expect(selectVariants(100)).toEqual([{ label: "thumb", width: 100 }]);
});

test("makeVariants resizes to webp, keeps aspect ratio and reports the original size", async () => {
  const { width, height, variants } = await makeVariants(await png(800, 400));
  expect({ width, height }).toEqual({ width: 800, height: 400 });
  expect(variants.map((v) => [v.label, v.width, v.height])).toEqual([
    ["thumb", 150, 75],
    ["small", 320, 160],
    ["medium", 640, 320],
  ]);
  expect((await sharp(variants[0]!.buffer).metadata()).format).toBe("webp");
});

test("makeVariants rejects data that is not an image", async () => {
  await expect(makeVariants(Buffer.from("not an image"))).rejects.toThrow();
});
