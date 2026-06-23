import mongoose from "mongoose";

export const productSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  desc: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  price: {
    type: Number,
  },
  category: {
    type: String,
  },
  sizes: {
    type: [String],
    enum: ["S", "M", "L", "XL"],
  },
  inStock: {
    type: Number,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
});
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
