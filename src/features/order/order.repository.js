import { ApplicationError } from "../../error-Handler/applicationError.js";
import { getDB } from "../../config/mongodb.js";
import { ObjectId } from "mongodb";
import OrderModel from "./order.model.js";
import { getClient } from "../../config/mongodb.js";

class OrderRepository {
  constructor() {
    this.collection = "orders";
  }
  async placeOrder(userId) {
    const client = getClient();
    const session = await client.startSession();
    try {
      const db = getDB();
      session.startTransaction();
      //1. get cart item and calculate total amount
      const { finalAmount, cartItems } = await this.totalAmount(
        userId,
        session,
      );
      if (!cartItems.length) {
        throw new ApplicationError("Cart is empty", 400);
      }

      const orderItems = cartItems.map((item) => ({
        productId: item.productID,
        name: item.productDetails.name,
        imageUrl: item.productDetails.imageUrl || null,
        price: item.productDetails.price,
        quantity: item.quantity,
        subtotal: item.totalAmount,
      }));

      //2. create an order record in the orders collection
      const newOrder = new OrderModel({
        userId: new ObjectId(userId),
        totalPrice: finalAmount,
        orderDate: new Date(),
        items: orderItems,
        status: "placed",
      });
      const collection = await db
        .collection(this.collection)
        .insertOne(newOrder, { session });
      //3. reduce the stock quantity for each product in the order
      for (let item of cartItems) {
        if (
          typeof item.productDetails.inStock === "number" &&
          item.productDetails.inStock < item.quantity
        ) {
          throw new ApplicationError(
            `Insufficient stock for ${item.productDetails.name}`,
            400,
          );
        }
        await db
          .collection("products")
          .updateOne(
            { _id: item.productID },
            { $inc: { inStock: -item.quantity } },
            { session },
          );
      }
      // throw new Error("Simulated error for rollback testing");
      //4. clear the cart for the user
      await db
        .collection("cart")
        .deleteMany({ userID: new ObjectId(userId) }, { session });
      await session.commitTransaction();
      await session.endSession();
      return { ...newOrder, _id: collection.insertedId };
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      console.log(error);
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError("Failed to add order", 500);
    }
  }
  async totalAmount(userId, session) {
    try {
      const db = getDB();
      const collection = db.collection("cart");
      const items = await collection
        .aggregate(
          [
            //1. get cart items for the user
            { $match: { userID: new ObjectId(userId) } },
            //2. get products from the products collection
            {
              $lookup: {
                from: "products",
                localField: "productID",
                foreignField: "_id",
                as: "productDetails",
              },
            },
            //3. unwind the productDetails array
            { $unwind: "$productDetails" },
            //4. calculate total amount for each cart item
            {
              $addFields: {
                totalAmount: {
                  $multiply: ["$quantity", "$productDetails.price"],
                },
              },
            },
            {
              $group: {
                _id: null,
                grandTotal: { $sum: "$totalAmount" },
                cartItems: { $push: "$$ROOT" },
              },
            },
          ],
          { session },
        )
        .toArray();
      const finalAmount = items[0]?.grandTotal ?? 0;
      const cartItems = items[0]?.cartItems ?? [];
      // return finalAmount;
      //   const finalTotalAmount = total.reduce(
      //     (acc, item) => acc + item.totalAmount,
      //     0,
      //   );
      return { finalAmount, cartItems };
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to calculate total amount", 500);
    }
  }

  async getOrders(userId) {
    try {
      const db = getDB();
      return await db
        .collection(this.collection)
        .find({ userId: new ObjectId(userId) })
        .sort({ orderDate: -1 })
        .toArray();
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to fetch orders", 500);
    }
  }

  async cancelOrder(orderId, userId) {
    const client = getClient();
    const session = await client.startSession();
    try {
      const db = getDB();
      session.startTransaction();

      const order = await db.collection(this.collection).findOne(
        {
          _id: new ObjectId(orderId),
          userId: new ObjectId(userId),
        },
        { session },
      );

      if (!order) {
        throw new ApplicationError("Order not found", 404);
      }

      if (order.status === "cancelled") {
        throw new ApplicationError("Order already cancelled", 400);
      }

      for (const item of order.items || []) {
        await db.collection("products").updateOne(
          { _id: new ObjectId(item.productId) },
          { $inc: { inStock: item.quantity } },
          { session },
        );
      }

      await db.collection(this.collection).updateOne(
        { _id: order._id },
        {
          $set: {
            status: "cancelled",
            cancelledAt: new Date(),
          },
        },
        { session },
      );

      await session.commitTransaction();
      await session.endSession();

      return {
        ...order,
        status: "cancelled",
        cancelledAt: new Date(),
      };
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      console.log(error);
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError("Failed to cancel order", 500);
    }
  }
}
export default OrderRepository;
