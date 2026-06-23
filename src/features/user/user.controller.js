import UserModel from "./user.model.js";
import UserRepository from "./user.repository.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
export default class UserController {
  //define methods for handle user related requests here, for getUser,addUser, delete user ,update user
  constructor() {
    this.userRepository = new UserRepository();
  }

  getUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      const user = UserModel.get(id);
      if (user === null) {
        return res.status(404).send("User not found");
      }
      return res.status(200).send(user);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
  async loginUser(req, res) {
    try {
      //destructer the data fields to get what data i need from req.body
      const { email, password } = req.body;
      //2. find the user with the email in database
      const user = await this.userRepository.findByEmail(email);
      //3. if user not found than send error response
      if (!user) {
        return res.status(401).send("Invalid email or password");
      } else {
        //compare the password with the hashed password in database
        const result = await bcrypt.compare(password, user.password);
        if (result) {
          //1.create jwt token
          const token = jwt.sign(
            {
              userID: user._id,
              email: user.email,
              type: user.type,
              name: user.name,
            },
            "uGVKPUGVZMnCyjtcfMBnCvnbGw+M8APYON43Sa6nPNw",
            { expiresIn: "1h" },
          );
          console.log("Entered password:", password);
          console.log("User object:", user);
          console.log("DB password:", user?.password);
          return res.status(200).json({
            token,
            user: this.sanitizeUser(user),
          });
        } else {
          return res.status(401).send("Invalid email or password");
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send("Something went wrong");
    }
  }

  async signUpUser(req, res, next) {
    try {
      //destructer the data fields to get what data i need from req.body
      const { name, email, password, address, contact, type } = req.body;
      //1. hash the password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 12);
      //than send these to user model to create new User in database
      const newUser = new UserModel({
        name,
        email,
        password: hashedPassword,
        address,
        contact,
        type,
      });
      await this.userRepository.add(newUser);
      return res.status(201).send(this.sanitizeUser(newUser));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getCurrentUser(req, res) {
    try {
      const user = await this.userRepository.findById(req.userID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(this.sanitizeUser(user));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
  async resetPassword(req, res) {
    const { newPassword } = req.body;
    const userID = req.userID;
    console.log("USER ID:", req.userID);

    console.log("USER ID:", userID);
    console.log("HEADER:", req.headers.authorization);

    //const hashedPassword = await bcrypt.hash(newPassword, 12);

    console.log("BODY:", req.body);

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    try {
      await this.userRepository.resetPassword(userID, hashedPassword);
      return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Something went wrong" + error.message });
    }
  }

  deleteUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      const deletedUser = userModel.delete(id);
      if (deletedUser === null) {
        return res.status(404).send("User not found");
      }
      return res.status(200).send(deletedUser);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
  updateUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      const updatedData = req.body;
      const updatedUser = userModel.update(id, updatedData);
      if (updatedUser === null) {
        return res.status(404).send("user does'nt exist");
      }
      return res.status(200).send(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  sanitizeUser(user) {
    if (!user) {
      return null;
    }

    const sanitized = user.toObject ? user.toObject() : { ...user };
    delete sanitized.password;
    return sanitized;
  }
}
