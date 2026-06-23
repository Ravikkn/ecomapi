import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    match: [/.+@.+\..+/, "Please fill a valid email address"],
  },
  password: {
    type: String,
    validate: {
      validator: function (value) {
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/.test(
          value,
        );
      },
      message:
        "Password must be 8-12 characters long and contain at least one letter and one number and a special character",
    },
  },
  address: {
    type: String,
  },
  contact: {
    type: Number,
  },
  type: {
    type: String,
    enum: ["buyer", "seller", "admin"],
  },
});
