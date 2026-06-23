import mongoose from "mongoose";
import { userSchema } from "./user.schema.js";
import { ApplicationError } from "../../error-Handler/applicationError.js";

const UserModel = mongoose.model("User", userSchema);

export default class UserRepository {
  async add(user) {
    try {
      const newUser = new UserModel(user);
      await newUser.save();
      return newUser;
    } catch (error) {
      console.log(error);
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      } else {
        throw new ApplicationError("Failed to add user", 500);
      }
    }
  }
  async login(email, password) {
    try {
      const user = await UserModel.findOne({ email, password });
      return user;
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to add user", 500);
    }
  }
  async findByEmail(email) {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to add user", 500);
    }
  }
  async findById(userID) {
    try {
      return await UserModel.findById(userID);
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to fetch user", 500);
    }
  }
  async resetPassword(userID, newPassword) {
    try {
      let user = await UserModel.findById(userID);
      if (!user) {
        throw new ApplicationError("User not found", 404);
      }
      user.password = newPassword;
      await user.save();
      return { message: "Password reset successful" };
    } catch (error) {
      console.log(error);
      throw new ApplicationError(
        "Failed to reset password" + error.message,
        500,
      );
    }
  }
}
