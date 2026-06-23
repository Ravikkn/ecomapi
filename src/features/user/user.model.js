//in memory users
import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-Handler/applicationError.js";

let users = [
  {
    id: 1,
    name: "Rohit Sharma",
    email: "rohit.sharma@example.com",
    password: "Rohit@123",
    address: "Jaipur, Rajasthan",
    contact: "9876543210",
    type: "seller",
  },
  {
    id: 2,
    name: "Priya Verma",
    email: "priya.verma@example.com",
    password: "Priya@123",
    address: "Delhi, India",
    contact: "9123456780",
    type: "seller",
  },
  {
    id: 3,
    name: "Amit Singh",
    email: "amit.singh@example.com",
    password: "Amit@123",
    address: "Mumbai, Maharashtra",
    contact: "9988776655",
    type: "seller",
  },
  {
    id: 4,
    name: "Sneha Patel",
    email: "sneha.patel@example.com",
    password: "Sneha@123",
    address: "Ahmedabad, Gujarat",
    contact: "9090909090",
    type: "seller",
  },
  {
    id: 5,
    name: "Vikram Yadav",
    email: "vikram.yadav@example.com",
    password: "Vikram@123",
    address: "Lucknow, Uttar Pradesh",
    contact: "9812345678",
    type: "seller",
  },
  {
    id: 6,
    name: "Anjali Mehta",
    email: "anjali.mehta@example.com",
    password: "Anjali@123",
    address: "Chandigarh, India",
    contact: "9345678901",
    type: "custmore",
  },
  {
    id: 7,
    name: "Karan Malhotra",
    email: "karan.malhotra@example.com",
    password: "Karan@123",
    address: "Pune, Maharashtra",
    contact: "9765432109",
    type: "custmore",
  },
  {
    id: 8,
    name: "Neha Gupta",
    email: "neha.gupta@example.com",
    password: "Neha@123",
    address: "Bhopal, Madhya Pradesh",
    contact: "9456781234",
    type: "custmore",
  },
  {
    id: 9,
    name: "Arjun Kapoor",
    email: "arjun.kapoor@example.com",
    password: "Arjun@123",
    address: "Hyderabad, Telangana",
    contact: "9871234560",
    type: "custmore",
  },
  {
    id: 10,
    name: "Pooja Choudhary",
    email: "pooja.choudhary@example.com",
    password: "Pooja@123",
    address: "Jodhpur, Rajasthan",
    contact: "9012345678",
    type: "custmore",
  },
];

//user model class and methods to fetch and add user in to array
export default class UserModel {
  constructor({ name, email, password, address, contact, type, id }) {
    this._id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.address = address;
    this.contact = contact;
    this.type = type;
  }
  static get(id) {
    const user = users.find((user) => user._id === id);
    if (!user) {
      return null;
    }
    return user;
  }
  static getAll() {
    return users;
  }

  static delete(id) {
    const index = users.findIndex((user) => user._id === id);

    if (index !== -1) {
      return users.splice(index, 1);
    }

    return null;
  }

  static update(id, updatedData) {
    const user = users.find((user) => user._id === id);
    if (!user) {
      return null;
    }
    Object.assign(user, updatedData);
    return user;
  }
}
