class OrderModel {
  constructor({ orderId, userId, totalPrice, orderDate, items = [], status = "placed" }) {
    this._id = orderId;
    this.userId = userId;
    this.totalPrice = totalPrice;
    this.orderDate = orderDate;
    this.items = items;
    this.status = status;
  }
}
export default OrderModel;
