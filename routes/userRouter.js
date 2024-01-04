import express from "express";
import userController from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", userController.getUsers);
userRouter.post("/", userController.createUser);
userRouter.post("/login", userController.loginUser);

export default userRouter;
