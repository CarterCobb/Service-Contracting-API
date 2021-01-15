import mongoose from "mongoose";
const { connect, set, connection } = mongoose;
import { Service } from "../Models/service.js";
import { User } from "../Models/user.js";
import { DATABASE_URL } from "../Helpers/KEYS.js";

/**
 * Connects and configues MongoDB
 */
class ConfigDatabase {
  constructor(instance) {
    this.app = instance;
    this.connectToMongoose();
  }

  /**
   * trys to connect to MongoDB and configures settings
   */
  connectToMongoose() {
    try {
      connect(DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }).catch((err) => {
        console.log("MONGO ERROR", err.message);
      });
      set("useCreateIndex", true);
      set("useFindAndModify", false);
    } catch (err) {
      console.log("error connecting to MongoDB", err);
    }
    connection.on("connected", () => {
      try {
        User.createCollection();
      } catch (error) {
        console.warn("User collection already created");
      }
      try {
        Service.createCollection();
      } catch (error) {
        console.warn("Service collection already created");
      }
      console.log("Connected to MongoDB");
    });
  }
}

export default ConfigDatabase;
