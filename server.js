import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import swagger from "swagger-ui-express";
import bodyParser from "body-parser";
import cors from "cors";

import productRouter from "./src/features/product/product.router.js";
import userRouter from "./src/features/user/user.router.js";
import orderRouter from "./src/features/order/order.router.js";
import likeRouter from "./src/features/like/likes.router.js";
//import basicAuthorizer from './src/middlewares/basicauth.middleware.js';
import jwtAuth from "./src/middlewares/jwtAuth.middleware.js";
import cartItemRouter from "./src/features/cart/cartitem.router.js";
import apiDocs from "./swagger.json" with { type: "json" };
import loggerMiddleware from "./src/middlewares/logger.middleware.js";
import { ApplicationError } from "./src/error-Handler/applicationError.js";

import { connectToMongoDB } from "./src/config/mongodb.js";
import { connectUsingMongoose } from "./src/config/mongooseConfig.js";
import mongoose, { mongo } from "mongoose";

// Create an instance of an Express server
const server = express();
const PORT = 3200;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON bodies
server.use(express.json());
server.use(bodyParser.urlencoded({ extended: true }));

//cors policy config

server.use(cors());
server.use(express.static(path.join(__dirname, "public")));
server.use("/uploads", express.static(path.join(__dirname, "uploads")));
// server.use((req,res,next)=>{
//     res.header("Access-Control-Allow-Origin", '*');
//     res.header('Access-Control-Allow-Headers', '*');
//     res.header('Access-Control-Allow-Methods', '*')
//     //return ok for preflight request
//     if(req.method=="OPTIONS"){
//         return res.sendStatus(200);
//     }
//     next();
// })

server.use(loggerMiddleware);
//route for documention
server.use("/api-docs", swagger.serve, swagger.setup(apiDocs));

//for all requests related to products, use the product router
server.use("/api/products", jwtAuth, productRouter);

// for all request related to users, use the user router
server.use("/api/users", userRouter);
//for all request related to cartItem, use the cart router
server.use("/api/cart", jwtAuth, cartItemRouter);
// for all request related to orders, use the order router
server.use("/api/orders", jwtAuth, orderRouter);
// for all request related to likes, use the like router
server.use("/api/likes", jwtAuth, likeRouter);

//default request handler
server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//error handle middleware
server.use((err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: err.message });
  }
  //user defined error
  if (err instanceof ApplicationError) {
    return res.status(err.code).json({ message: err.message });
  }
  //server Error
  console.log(err);
  return res.status(503).json({
    message: "Something went wrong, please try again after some time.",
  });
});

const startServer = async () => {
  try {
    await Promise.all([connectUsingMongoose(), connectToMongoDB()]);
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
