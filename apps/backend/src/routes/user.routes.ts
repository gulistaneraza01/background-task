import { Router } from "express";
import { register } from "../controllers/user.controller";

export const userRouter = Router();
userRouter.post("/register", register);
