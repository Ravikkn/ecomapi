import { MongoClient } from "mongodb";
import {
  formatMongoConnectionError,
  getFallbackMongoUri,
  getPrimaryMongoUri,
  shouldRetryWithFallback,
} from "./mongoConnection.helper.js";

let db;
let client;

export const connectToMongoDB = async () => {
  const url = getPrimaryMongoUri();

  console.log("ENV VALUE:", url);

  if (!url) {
    throw new Error("MONGO_URI is undefined ❌");
  }

  if (db) return db;

  try {
    client = new MongoClient(url);
    await client.connect();
  } catch (error) {
    if (shouldRetryWithFallback(error, url)) {
      const fallbackUri = getFallbackMongoUri();
      console.warn("Atlas SRV lookup failed. Retrying native Mongo client with fallback Mongo URI.");
      client = new MongoClient(fallbackUri);
      await client.connect();
    } else {
      throw formatMongoConnectionError(error, url);
    }
  }

  db = client.db();
  console.log("MongoDB Connected");
  createCounter(client.db());
  createIndexes(client.db());

  return db;
};

export const getClient = () => client;
const createCounter = async (db) => {
  const countersCollection = db.collection("counters");
  const existingCounter = await countersCollection.findOne({
    _id: "cartItemID",
  });

  if (!existingCounter) {
    await countersCollection.insertOne({ _id: "cartItemID", value: 0 });
  }
};

const createIndexes = async (db) => {
  try {
    await db.collection("products").createIndex({ price: 1 });
    await db.collection("products").createIndex({ name: 1, category: -1 });
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
  console.log("Indexes created successfully");
};
//

export const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectToMongoDB first.");
  }
  return db;
};
