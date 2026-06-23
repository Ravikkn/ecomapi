import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-Handler/applicationError.js";

class UserRepository {
  constructor() {
    this.collection = "users";
  }
  async add(user) {
    try {
      //1.get the database
      const db = getDB();
      //2. get the collection
      const collection = db.collection(this.collection);
      //3. insert the data
      const result = await collection.insertOne(user);
      return {
        success: true,
        data: {
          ...user,
          _id: result.insertedId,
        },
      };
      //user.id = users.length + 1;
      // users.push(user);
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to add user", 500);
    }
  }
  async findByEmail(email) {
    try {
      //1.get the database
      const db = getDB();
      //2. get the collection
      const collection = db.collection(this.collection);
      //3. insert the data
      const user = await collection.findOne({ email });
      return user;
      //user.id = users.length + 1;
      // users.push(user);
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Failed to add user", 500);
    }
  }
}

export default UserRepository;
