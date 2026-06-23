import OrderRepository from "./order.repository.js";

class OrderController {
  constructor() {
    this.repository = new OrderRepository();
  }

  async placeOrder(req, res, next) {
    try {
      const userId = req.userID;
      const order = await this.repository.placeOrder(userId);
      res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
      res.status(error.code || 500).json({ error: error.message });
    }
  }

  async getOrders(req, res, next) {
    try {
      const userId = req.userID;
      const orders = await this.repository.getOrders(userId);
      res.status(200).json(orders);
    } catch (error) {
      res.status(error.code || 500).json({ error: error.message });
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const userId = req.userID;
      const order = await this.repository.cancelOrder(req.params.id, userId);
      res.status(200).json({ message: "Order cancelled successfully", order });
    } catch (error) {
      res.status(error.code || 500).json({ error: error.message });
    }
  }
}
export default OrderController;
