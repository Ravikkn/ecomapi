import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-Handler/applicationError.js";
import { ObjectId } from "mongodb";
class CartRepository {
  constructor() {
    this.collection = "cart";
  }
  async add(productID, userID, quantity) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      const id = await this.getNextCounter(db);
      if (!ObjectId.isValid(userID) || !ObjectId.isValid(productID)) {
        throw new ApplicationError("Invalid user ID or product ID", 400);
      }
      if (!quantity || isNaN(quantity) || quantity <= 0) {
        throw new ApplicationError("Invalid quantity", 400);
      }

      await collection.updateOne(
        {
          productID: new ObjectId(productID),
          userID: new ObjectId(userID),
        },
        {
          $setOnInsert: { _id: id }, // set _id only if it's a new document
          $inc: { quantity: quantity }, // increase quantity
        },
        {
          upsert: true,
        },
      );
      return { message: "Item added to cart successfully" };
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to add item to cart", 500);
    }
  }
  async get(userID) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      if (!ObjectId.isValid(userID)) {
        throw new ApplicationError("Invalid user ID", 400);
      }
      const cartItems = await collection
        .find({ userID: new ObjectId(userID) })
        .toArray();

      return { message: "Cart items fetched successfully", items: cartItems };
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to fetch cart items", 500);
    }
  }
  async delete(cartItemID, userID) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      if (!ObjectId.isValid(userID)) {
        throw new ApplicationError("Invalid user ID", 400);
      }
      const resolvedCartItemId = ObjectId.isValid(cartItemID)
        ? new ObjectId(cartItemID)
        : Number.isNaN(Number(cartItemID))
          ? cartItemID
          : Number(cartItemID);
      const result = await collection.deleteOne({
        _id: resolvedCartItemId,
        userID: new ObjectId(userID),
      });
      if (result.deletedCount === 0) {
        return "Cart item not found or you are not authorized to delete this item";
      }
      return { message: "Item deleted successfully" };
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to delete item from cart", 500);
    }
  }

  async getNextCounter(db) {
    const resultDoc = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: "cartItemID" },
        { $inc: { value: 1 } },
        { upsert: true, returnDocument: "after" },
      );
    console.log("Counter updated:", resultDoc);
    return resultDoc.value;
  }
}
export default CartRepository;
