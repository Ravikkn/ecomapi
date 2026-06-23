import express from "express";
import CartItemController from "./cartitem.controller.js";

//initialize the express router
const cartItemRouter = express.Router();

//create an instance of cartItemController
const cartItemController = new CartItemController();

//routes..
cartItemRouter.delete("/:id", (req, res) => {
  cartItemController.deleteItem(req, res);
});
cartItemRouter.post("/addProduct", (req, res) => {
  cartItemController.addItem(req, res);
});
cartItemRouter.get("/", (req, res) => {
  cartItemController.showItem(req, res);
});

export default cartItemRouter;
