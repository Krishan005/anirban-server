import mongoose, { ConnectOptions } from "mongoose";
import config from "config";
import log from "../logger";

function dbConnect() {
  const dbUri = config.get("dbUri") as string;

  mongoose.set("strictQuery", false);
  mongoose
    .connect(dbUri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    } as ConnectOptions)
    .then(() => {
      log.info("Database connected");
    })
    .catch((err) => {
      log.error("DB connect error due to ", err.message);
      process.exit(1);
    });
}

export default dbConnect;