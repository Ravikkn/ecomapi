import CartItemModel from "./cartitem.model.js";
import CartItemRepository from "./cart.repository.js";

export default class CartItemController {
  constructor() {
    this.cartItemRepository = new CartItemRepository();
  }
  async addItem(req, res) {
    try {
      const { productID, quantity } = req.body;
      const userID = req.userID;
      if (!userID) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const numericQuantity = Number(quantity);
      if (!productID || isNaN(numericQuantity) || numericQuantity <= 0) {
        return res.status(400).json({
          message: "Valid productID and quantity (>0) required",
        });
      }
      await this.cartItemRepository.add(productID, userID, quantity);
      return res.status(201).json({
        message: "Item added to cart",
      });
    } catch (error) {
      console.log(error);
      return res.status(error.statusCode || 500).json({
        message: error.message || "Internal server error",
      });
    }
  }

  async showItem(req, res) {
    try {
      const userID = req.userID;
      if (!userID) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const result = await this.cartItemRepository.get(userID);
      if (result.length === 0) {
        return res.status(404).json({ message: "No items in cart" });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(error.statusCode || 500).json({
        message: error.message || "Internal server error",
      });
    }
  }
  async deleteItem(req, res) {
    try {
      const userID = req.userID;
      const cartItemID = req.params.id;
      if (!userID) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await this.cartItemRepository.delete(cartItemID, userID);
      if (!result || result.deletedCount === 0) {
        return res.status(404).json({
          message: "Cart item not found",
        });
      }
      return res
        .status(200)
        .json({ message: "Item deleted successfully ", result });
    } catch (error) {
      console.log(error);
      return res.status(error.statusCode || 500).json({
        message: error.message || "Internal server error",
      });
    }
  }
}
