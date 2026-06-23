// import express.
import express from "express";
import OrderController from "./order.controller.js";

//initialize the express router
const orderRouter = express.Router();

//create an instance of OrderController
const orderController = new OrderController();

//all order related routes will be defined here
//localhost:3000/api/orders/ is the base path
orderRouter.post("/", (req, res, next) => {
  orderController.placeOrder(req, res, next);
});
orderRouter.get("/", (req, res, next) => {
  orderController.getOrders(req, res, next);
});
orderRouter.delete("/:id", (req, res, next) => {
  orderController.cancelOrder(req, res, next);
});

//export the router to be used in server.js

export default orderRouter;
