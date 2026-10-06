import { Router } from "express";
import { complete, create, show } from "../controllers/image.controller";

export const imageRouter = Router();
imageRouter.post("/images", create);
imageRouter.post("/images/:id/complete", complete);
imageRouter.get("/images/:id", show);
