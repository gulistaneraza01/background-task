import type { Request, Response } from "express";
import { ALLOWED_TYPES, completeImage, createImage, getImage } from "../services/image.service";

// ponytail: no auth yet, anyone can create upload URLs. Put these routes behind auth before real use.
const parseId = (req: Request) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function create(req: Request, res: Response) {
  const contentType = req.body?.contentType;
  if (typeof contentType !== "string" || !ALLOWED_TYPES.includes(contentType)) {
    return res.status(400).json({ error: `contentType must be one of ${ALLOWED_TYPES.join(", ")}` });
  }
  res.status(201).json(await createImage(contentType));
}

export async function complete(req: Request, res: Response) {
  const id = parseId(req);
  if (!id) return res.status(400).json({ error: "Invalid id" });
  const result = await completeImage(id);
  if (result === "not_found") return res.status(404).json({ error: "Image not found" });
  if (result === "not_uploaded") return res.status(409).json({ error: "Upload not found in S3 yet" });
  if (result === "too_large") return res.status(413).json({ error: "File exceeds the size limit and was removed" });
  res.status(202).json({ status: result });
}

export async function show(req: Request, res: Response) {
  const id = parseId(req);
  if (!id) return res.status(400).json({ error: "Invalid id" });
  const image = await getImage(id);
  if (!image) return res.status(404).json({ error: "Image not found" });
  res.json(image);
}
