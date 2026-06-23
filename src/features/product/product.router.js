// import express.
import express from "express";
import ProductController from "./product.controller.js";
import Upload from "../../middlewares/fileUpload.middleware.js";
import authorizeRole from "../../middlewares/authorizeRole.middleware.js";

//initialize the express router
const productRouter = express.Router();

//create an instance of ProductController
const productController = new ProductController();

//all product related routes will be defined here
//localhost:3000/api/products/ is the base path
productRouter.get("/filter", (req, res) => {
  productController.filterProducts(req, res);
});
productRouter.get("/", (req, res) => {
  productController.getAllProducts(req, res);
});
productRouter.post("/", authorizeRole("admin"), Upload.single("imageUrl"), (req, res) => {
  productController.addProduct(req, res);
});
productRouter.get("/averagePrice", (req, res, next) => {
  productController.averagePrice(req, res);
});
productRouter.put("/:id", authorizeRole("admin"), Upload.single("imageUrl"), (req, res) => {
  productController.updateProduct(req, res);
});
productRouter.delete("/:id", authorizeRole("admin"), (req, res) => {
  productController.deleteProduct(req, res);
});
productRouter.get("/:id", (req, res) => {
  productController.getOneProduct(req, res);
});
productRouter.post("/rate", (req, res) => {
  productController.rateProduct(req, res);
});

//localhost:3000/api/products/filter?minPrice=1000&maxPrice=5000&category=Footwear
//https://localhost:3000/api/products/filter?minPrice=1000&maxPrice=5000&category=Footwear

//export the router to be used in server.js

export default productRouter;
