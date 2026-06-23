import { ApplicationError } from "../../error-Handler/applicationError.js";
import ProductModel from "./product.model.js";
import ProductRepository from "./product.repository.js";
import { ObjectId } from "mongodb";
export default class ProductController {
  constructor() {
    this.repository = new ProductRepository();
  }
  // Define methods for handling product-related requests here
  // For example: getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, etc.

  // Logic to get all products
  async getAllProducts(req, res) {
    try {
      // Logic to get all products
      const product = await this.repository.getAll();
      return res.status(200).send(product);
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  // Logic to add a new product
  async addProduct(req, res) {
    try {
      if (!req.body) {
        return res.status(400).send("Request body is missing");
      }
      const newProduct = new ProductModel(this.buildProductPayload(req));
      const productCreated = await this.repository.add(newProduct);
      res.status(201).send(productCreated);
    } catch (error) {
      console.log(error);
      res.status(error.code || 500).json({ message: error.message });
    }
  }
  // Logic to get a single product by ID
  async getOneProduct(req, res) {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const productID = new ObjectId(req.params.id);
      const product = await this.repository.get(productID);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
  // Logic to rate a product
  async rateProduct(req, res) {
    try {
      const userID = req.userID;
      const { productID, rating } = req.body;
      // Check if user is authenticated
      if (!userID) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // validation
      if (!productID || rating === undefined) {
        return res
          .status(400)
          .json({ message: "productID and rating required" });
      }
      const numericRating = Number(rating);

      if (numericRating < 1 || numericRating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      await this.repository.rateProduct(userID, productID, numericRating);
      return res.status(200).send("rating has been done");
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  // Logic to filter products based on criteria like price range, category, etc.
  async filterProducts(req, res) {
    try {
      const minPrice = parseFloat(req.query.minPrice);
      const maxPrice = parseFloat(req.query.maxPrice);
      const category = req.query.category;
      const result = await this.repository.filter(minPrice, maxPrice, category);
      res.status(200).send(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
  //average price of all products
  async averagePrice(req, res, next) {
    try {
      const result = await this.repository.averagePricePerCategory();
      res.status(200).json({ averagePrice: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  async updateProduct(req, res) {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const updatedProduct = await this.repository.update(
        req.params.id,
        this.buildProductPayload(req),
      );

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.log(error);
      return res.status(error.code || 500).json({ message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      await this.repository.delete(req.params.id);
      return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(error.code || 500).json({ message: error.message });
    }
  }

  buildProductPayload(req) {
    const { name, desc, price, categories, category, sizes, inStock } = req.body;
    const imageUrl = req.file ? req.file.filename : req.body.imageUrl || null;
    const parsedCategories = Array.isArray(categories)
      ? categories
      : categories
        ? categories.split(",").map((entry) => entry.trim()).filter(Boolean)
        : [];

    return {
      name,
      desc,
      imageUrl,
      price: price !== undefined ? parseFloat(price) : undefined,
      category: category || parsedCategories[0] || "General",
      categories: parsedCategories,
      sizes: Array.isArray(sizes)
        ? sizes
        : sizes
          ? sizes.split(",").map((entry) => entry.trim()).filter(Boolean)
          : [],
      inStock: inStock !== undefined ? Number(inStock) : undefined,
    };
  }
}
