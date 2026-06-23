export default class CartItemModel {
    constructor(productID, userID, quantity, id){
        this.productID = productID;
        this.userID = userID;
        this.quantity = quantity;
        this.id= id;
    }

    static add(productID, userID, quantity){

    if(!productID || !userID || !quantity){
        return "Invalid input";
    }

    const cartItem = new CartItemModel(productID, userID, quantity);
    cartItem.id = cartItems.length + 1;

    cartItems.push(cartItem);

    return null; // SUCCESS
}

   static get(userID){

    if(!userID){
        return "Invalid input";
    }

    const item = cartItems.filter((u) => u.userID === userID);

    if(!item){
        return "No cart items found";
    }

    return item;
}
static delete(cartItemID, userID){
    cartItemID = parseInt(cartItemID);
    userID = parseInt(userID);
    const itemIndex = cartItems.findIndex((u)=> u.id === cartItemID && u.userID === userID);

    if(itemIndex === -1){
        return "no item found";
    }else{
        cartItems.splice(itemIndex, 1)
    }
}

}

var cartItems = [ new CartItemModel(1,1,2)]