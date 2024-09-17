import { Router } from "express";
import {
  sendOpt,
  verifyOtp,
  logoutUser,
  updateUser,
} from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/send-otp").post(sendOpt);
userRouter.route("/verify-otp").post(verifyOtp);
userRouter.route("/update").post(updateUser);


userRouter.route("/logout").post(verifyAccessToken, logoutUser);

userRouter.get("/access-token-verify", verifyAccessToken, (req, res) => {
  return res.status(200).json({ message: "Access Token is Valid" });
});

export default userRouter;
