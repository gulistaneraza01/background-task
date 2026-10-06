import { Router } from "express";
import { remove, restore } from "../controllers/account.controller";

export const accountRouter = Router();
accountRouter.delete("/account", remove);
accountRouter.post("/account/restore", restore);
