import mongoose from "mongoose";
import { likeSchema } from "./likes.schema.js";
import { ApplicationError } from "../../error-Handler/applicationError.js";
import { ObjectId } from "mongodb";

const likeModel = mongoose.model("Like", likeSchema);

export class LikeRepository {
  async likeProduct(userId, productId) {
    try {
      return await likeModel.findOneAndUpdate(
        {
          user: new ObjectId(userId),
          likable: new ObjectId(productId),
          refPath: "Product",
        },
        {
          $setOnInsert: {
            user: new ObjectId(userId),
            likable: new ObjectId(productId),
            refPath: "Product",
          },
        },
        { upsert: true, new: true },
      );
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to add likes", 500);
    }
  }

  async likeCategory(userId, categoryId) {
    try {
      return await likeModel.findOneAndUpdate(
        {
          user: new ObjectId(userId),
          likable: new ObjectId(categoryId),
          refPath: "Category",
        },
        {
          $setOnInsert: {
            user: new ObjectId(userId),
            likable: new ObjectId(categoryId),
            refPath: "Category",
          },
        },
        { upsert: true, new: true },
      );
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to add product", 500);
    }
  }
  //get
  async getLikes(type, id) {
    try {
      return await likeModel
        .find({
          likable: new ObjectId(id),
          refPath: type,
        })
        .populate("user")
        .populate({ path: "likable", model: type });
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to add product", 500);
    }
  }
}
