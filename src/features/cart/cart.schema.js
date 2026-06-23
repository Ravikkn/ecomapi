import mongoose from "mongoose";

export const cartSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
    productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",},
    quantity: {
    type: Number,
  },
});
