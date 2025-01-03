import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import log from "./app/logger"
import dbConnect from "./app/db/connect";
import indexRoute from "./app/routes";

dotenv.config();

const app = express();

const corsOptions = {
    origin: ["http://localhost:3000"]
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/storages", express.static(path.join(__dirname, "storages")));


app.use("/", indexRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    log.info(`App is running at http://${process.env.HOST}:${process.env.PORT}/`);
    dbConnect();
});