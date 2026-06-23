import express from "express";
import { LikeController } from "./likes.controller.js";

//initialize the express router
const likeRouter = express.Router();

//create an instance of OrderController
const likeController = new LikeController();

likeRouter.post("/", (req, res, next) => {
  likeController.likeItem(req, res, next);
});
likeRouter.get("/", (req, res, next) => {
  likeController.getLikes(req, res, next);
});

export default likeRouter;
