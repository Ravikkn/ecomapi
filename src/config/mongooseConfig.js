import mongoose from "mongoose";
import dotenv from "dotenv";
import { categoryModel } from "../features/product/category.schema.js";
import {
  formatMongoConnectionError,
  getFallbackMongoUri,
  getPrimaryMongoUri,
  shouldRetryWithFallback,
} from "./mongoConnection.helper.js";

dotenv.config({ path: "./.env" });

export const connectUsingMongoose = async () => {
  const primaryUri = getPrimaryMongoUri();
  try {
    await mongoose.connect(primaryUri);
    console.log("Connected to MongoDB using Mongoose");
    await addCategories();
  } catch (error) {
    if (shouldRetryWithFallback(error, primaryUri)) {
      const fallbackUri = getFallbackMongoUri();
      console.warn("Atlas SRV lookup failed. Retrying Mongoose with fallback Mongo URI.");
      await mongoose.connect(fallbackUri);
      console.log("Connected to fallback MongoDB using Mongoose");
      await addCategories();
      return;
    }

    console.error(
      "Error connecting to MongoDB:",
      formatMongoConnectionError(error, primaryUri),
    );
    throw formatMongoConnectionError(error, primaryUri);
  }
};

async function addCategories() {
  const categories = await categoryModel.find();
  if (!categories || categories.length === 0) {
    await categoryModel.insertMany([
      { name: "Books" },
      { name: "Clothing" },
      { name: "Electronics" },
    ]);
  }
  console.log("Categories are added");
}
