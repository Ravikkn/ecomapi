import express from "express";
import UserController from "./user.controller.js";
import jwtAuth from "../../middlewares/jwtAuth.middleware.js";

//initialize the express router
const userRouter = express.Router();

//create an instance of userController
const userController = new UserController();

//all product related routes will be defined here
//localhost:3000/api/user/ is the base path

userRouter.post("/login", (req, res) => {
  userController.loginUser(req, res);
});
userRouter.post("/signup", (req, res, next) => {
  userController.signUpUser(req, res, next);
});
userRouter.get("/me", jwtAuth, (req, res) => {
  userController.getCurrentUser(req, res);
});
userRouter.post("/:id/update", userController.updateUser);
userRouter.get("/:id/delete", userController.deleteUser);
userRouter.post("/resetPassword", jwtAuth, (req, res) => {
  userController.resetPassword(req, res);
});

export default userRouter;
