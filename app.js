import express from "express";
import morgan from "morgan";
import cors from "cors";
import noteRouter from "./routes/noteRouter.js";
import userRouter from "./routes/userRouter.js";
import unknownEndpoint from "./middlewares/unknownEndpoint.js";
import connectToDB from "./utils/connectToDB.js";
import errorHandler from "./middlewares/errorHandler.js";
import config from "./utils/config.js";
import upload from "./utils/multer.js";

const MONGODB_URI = config.MONGODB_URI;
const app = express();

connectToDB(MONGODB_URI);

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));
app.use(morgan(":method :url :status :body"));

app.use("/users", userRouter);
app.use("/notes", upload.single("image"), noteRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
