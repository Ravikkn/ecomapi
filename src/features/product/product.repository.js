import { getDB } from "../../config/mongodb.js";
import mongoose from "mongoose";
import { ApplicationError } from "../../error-Handler/applicationError.js";
import { ObjectId } from "mongodb";
import { productSchema } from "./product.schema.js";
import { reviewSchema } from "./reviews.schema.js";
import { categoryModel } from "./category.schema.js";

const ProductModel = mongoose.model("product", productSchema);
const ReviewModel = mongoose.model("Review", reviewSchema);

class ProductRepository {
  constructor() {
    this.collection = "products";
  }
  async add(productData) {
    try {
      console.log(productData);
      //add product
      const newProduct = new ProductModel(productData);
      const savedProduct = await newProduct.save();
      //2. update categories

      await categoryModel.updateMany(
        { _id: { $in: productData.categories } },
        {
          $push: { products: new ObjectId(savedProduct._id) },
        },
      );
      //push category into new products category array
      return savedProduct;
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to add product", 500);
    }
  }
  async getAll() {
    try {
      //1.get the database
      const db = getDB();
      //2. get the collection
      const collection = db.collection(this.collection);
      //3. insert the data
      const products = await collection.find({}).toArray();
      return products;
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to get products", 500);
    }
  }
  async get(id) {
    try {
      //1.get the database
      const db = getDB();
      //2. get the collection
      const collection = db.collection(this.collection);
      //3. insert the data
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to get products", 500);
    }
  }
  async filter(minPrice, maxPrice, category) {
    try {
      //1.get the database
      const db = getDB();
      //2. get the collection
      const collection = db.collection(this.collection);
      //3. insert the data
      const filterQuery = {};
      if (minPrice) {
        filterQuery.price = { $gte: parseFloat(minPrice) };
      }
      if (maxPrice) {
        filterQuery.price = {
          ...filterQuery.price,
          $lte: parseFloat(maxPrice),
        };
      }
      if (category) {
        filterQuery.$or = [
          { category: category },
          { categories: { $in: [category] } },
        ];
      }
      const products = await collection.find(filterQuery).toArray();
      return products;
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to filter products", 500);
    }
  }
  async rateProduct(userID, productId, rating) {
    try {
      //check if the product exists
      const findProduct = await ProductModel.findById(productId);
      if (!findProduct) {
        throw new ApplicationError("Product not found", 404);
      }
      //check if user already rated the product
      const existingReview = await ReviewModel.findOne({
        product: new ObjectId(productId),
        user: new ObjectId(userID),
      });
      if (existingReview) {
        //update the rating
        existingReview.rating = rating;
        await existingReview.save();
      } else {
        //add new rating
        const newReview = new ReviewModel({
          user: new ObjectId(userID),
          product: new ObjectId(productId),
          rating: rating,
        });
        await newReview.save();
        //push the review to product's reviews array
        findProduct.reviews.push(newReview._id);
        await findProduct.save();
      }
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to rate product", 500);
    }
  }
  // async rateProduct(userID, productId, rating) {
  //   try {
  //     const db = getDB();
  //     const collection = db.collection(this.collection);

  //     const productObjectId = new ObjectId(productId);

  //     //  Check if user already rated
  //     const existing = await collection.findOne({
  //       _id: productObjectId,
  //       "ratings.userID": userID,
  //     });

  //     if (existing) {
  //       // UPDATE existing rating
  //       await collection.updateOne(
  //         {
  //           _id: productObjectId,
  //           "ratings.userID": userID,
  //         },
  //         {
  //           $set: { "ratings.$.rating": Number(rating) },
  //         },
  //       );
  //     } else {
  //       //  ADD new rating
  //       await collection.updateOne(
  //         { _id: productObjectId },
  //         {
  //           $push: {
  //             ratings: {
  //               userID,
  //               rating: Number(rating),
  //             },
  //           },
  //         },
  //       );
  //     }
  //   } catch (error) {
  //     console.log("REAL ERROR:", error);
  //     throw new ApplicationError("Failed to rate product", 500);
  //   }
  // }

  async averagePricePerCategory(req, res) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      return collection
        .aggregate([
          {
            //stage 1: group by category and calculate average price
            $group: {
              _id: "$category",
              averagePrice: { $avg: "$price" },
            },
          },
        ])
        .toArray();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  async update(id, productData) {
    try {
      const updates = Object.fromEntries(
        Object.entries(productData).filter(([, value]) => value !== undefined),
      );
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true },
      );

      if (!updatedProduct) {
        throw new ApplicationError("Product not found", 404);
      }

      return updatedProduct;
    } catch (error) {
      console.log(error);
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError("Failed to update product", 500);
    }
  }

  async delete(id) {
    try {
      const deletedProduct = await ProductModel.findByIdAndDelete(id);
      if (!deletedProduct) {
        throw new ApplicationError("Product not found", 404);
      }

      await categoryModel.updateMany(
        { products: new ObjectId(id) },
        { $pull: { products: new ObjectId(id) } },
      );

      return deletedProduct;
    } catch (error) {
      console.log(error);
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError("Failed to delete product", 500);
    }
  }

  //race condtion fails when two request comes at same time
  // for same product, both will find that there is no rating for that user and
  //  then both will try to insert new rating, this will cause duplicate rating
  //  for same user for same product

  // rateProductOld(userID, productID, rating) {
  //   try {
  //     const db = getDB();
  //     const collection = db.collection(this.collection);

  //     const productObjectId = new ObjectId(productID);
  //     // 1. Remove existing rating of the user if exists
  //     collection.updateOne(
  //       { _id: productObjectId },
  //       { $pull: { ratings: { userID: new ObjectId(userID) } } },
  //     );
  //     // 2. Add new rating
  //     collection.updateOne(
  //       { _id: productObjectId },
  //       {
  //         $push: {
  //           ratings: {
  //             userID: new ObjectId(userID),
  //             rating: Number(rating),
  //           },
  //         },
  //       },
  //     );
  //   } catch (error) {
  //     console.log("REAL ERROR:", error);
  //     throw new ApplicationError("Failed to rate product", 500);
  //   }
  // }
}

export default ProductRepository;
