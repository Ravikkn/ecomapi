import { LikeRepository } from "./like.repository.js";

export class LikeController {
  constructor() {
    this.likeRepository = new LikeRepository();
  }
  async likeItem(req, res, next) {
    try {
      const { type, id } = req.body;
      const userId = req.UserID;
      if (type != "Product" && type != "Category") {
        throw new Error("Invalid type");
      }
      if (type == "Product") {
        await this.likeRepository.likeProduct(userId, id);
      } else {
        await this.likeRepository.likeCategory(userId, id);
      }
      return res.status(200).json({ message: "like done" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
  async getLikes(req, res, next) {
    try {
      const { id, type } = req.query;
      const likes = await this.likeRepository.getLikes(type, id);
      return res.status(200).send(likes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
}
