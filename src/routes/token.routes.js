import express from "express";
import { resendToken, verifyToken } from "../controllers/token.controller.js";

export const tokenRouter = express.Router();

tokenRouter.route("/verify").get(verifyToken);
tokenRouter.route("/resend").post(resendToken);
tokenRouter.route("/update/password").get(verifyToken);
