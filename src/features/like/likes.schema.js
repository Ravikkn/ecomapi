import mongoose from "mongoose";

export const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "refPath",
  },
  refPath: {
    type: String,
    enum: ["Product", "Category"],
  },
});
