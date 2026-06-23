import { ApplicationError } from "../../error-Handler/applicationError.js";
import UserModel from "../user/user.model.js";

export default class ProductModel {
  constructor({ name, desc, imageUrl, price, categories, category, sizes, inStock, id }) {
    this._id = id;
    this.name = name;
    this.desc = desc;
    this.imageUrl = imageUrl;
    this.price = price;
    this.categories = categories;
    this.category = category;
    this.sizes = sizes;
    this.inStock = inStock;
  }

  static get(id) {
    const product = products.find((product) => product._id === id);
    return product;
  }
  static getAll() {
    return products;
  }
  // static add(product){
  //  product.id = products.length + 1; // Simple ID generation logic
  //     products.push(product);
  //    return product;
  //}
  static filter(minPrice, maxPrice, category) {
    const result = products.filter((product) => {
      return (
        (!minPrice || product.price >= minPrice) &&
        (!maxPrice || product.price <= maxPrice) &&
        (!category || product.category === category)
      );
    });
    return result;
  }

  static ratingProduct(userId, productId, rating) {
    //1. validate userId and ProductId
    const user = UserModel.get(parseInt(userId));

    if (!user) {
      throw ApplicationError("User not found", 404);
    }

    const product = this.get(parseInt(productId));

    if (!product) {
      throw ApplicationError("User not found", 400);
    }

    //2. if user and product both available than give rating check first if there is rating on product
    if (!product.ratings) {
      product.ratings = [];
      product.ratings.push({ userId: userId, ratings: rating });
    } else {
      //if rating do exist than update the rating
      const existingRatingIndex = product.ratings.findIndex(
        (r) => r.userId == userId,
      );
      if (existingRatingIndex >= 0) {
        product.ratings[existingRatingIndex] = {
          userId: userId,
          ratings: rating,
        };
      } else {
        product.ratings = [];
        product.ratings.push({ userId: userId, ratings: rating });
      }
    }
  }
}
const products = [
  {
    id: 1,
    name: "Nike Air Max",
    desc: "Lightweight running shoes",
    imageUrl: "https://picsum.photos/200?1",
    price: 4999,
    category: "Footwear",
    sizes: ["7", "8", "9", "10"],
  },
  {
    id: 2,
    name: "Adidas Ultraboost",
    desc: "High performance sports shoes",
    imageUrl: "https://picsum.photos/200?2",
    price: 6999,
    category: "Footwear",
    sizes: ["8", "9", "10"],
  },
  {
    id: 3,
    name: "Puma Hoodie",
    desc: "Winter warm hoodie",
    imageUrl: "https://picsum.photos/200?3",
    price: 1999,
    category: "Clothing",
    sizes: ["M", "L", "XL"],
  },
  {
    id: 4,
    name: "Levi's Jeans",
    desc: "Slim fit denim jeans",
    imageUrl: "https://picsum.photos/200?4",
    price: 2499,
    category: "Clothing",
    sizes: ["30", "32", "34", "36"],
  },
  {
    id: 5,
    name: "Casio Watch",
    desc: "Classic analog wrist watch",
    imageUrl: "https://picsum.photos/200?5",
    price: 1599,
    category: "Accessories",
    sizes: [],
  },
  {
    id: 6,
    name: "Wildcraft Backpack",
    desc: "Durable travel backpack",
    imageUrl: "https://picsum.photos/200?6",
    price: 1799,
    category: "Accessories",
    sizes: [],
  },
  {
    id: 7,
    name: "Apple AirPods",
    desc: "Wireless Bluetooth earbuds",
    imageUrl: "https://picsum.photos/200?7",
    price: 12999,
    category: "Electronics",
    sizes: [],
  },
  {
    id: 8,
    name: "Basic Cotton T-Shirt",
    desc: "Premium cotton round neck t-shirt",
    imageUrl: "https://picsum.photos/200?8",
    price: 899,
    category: "Clothing",
    sizes: ["S", "M", "L"],
  },
  {
    id: 9,
    name: "Reebok Track Pants",
    desc: "Comfortable gym wear",
    imageUrl: "https://picsum.photos/200?9",
    price: 1499,
    category: "Clothing",
    sizes: ["M", "L", "XL"],
  },
  {
    id: 10,
    name: "Woodland Boots",
    desc: "Rugged outdoor boots",
    imageUrl: "https://picsum.photos/200?10",
    price: 4599,
    category: "Footwear",
    sizes: ["8", "9", "10"],
  },
];
