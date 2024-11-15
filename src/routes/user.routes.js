import express from "express";
import { loginUser, logoutUser, registerUser, updateUser, updateAvatar, changePassword } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { auth } from "../middlewares/auth.js";
import { checkChangePassword } from "../controllers/token.controller.js";
export const userRouter = express.Router();

userRouter.route("/signup").post(upload.fields([{ name: 'avatar', maxCount: 1 }]), registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(auth, logoutUser);
userRouter.route("/update").patch(auth, updateUser);
userRouter.route("/update/avatar").patch(auth, upload.fields([{ name: 'avatar', maxCount: 1 }]), updateAvatar);
userRouter.route("/update/password").patch(auth, changePassword);

//Controller from token
userRouter.route("/update/password/verify").get(checkChangePassword);