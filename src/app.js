import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
//this will allow the data endcode in url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(cookieParser());

//routes imports
import userRouter from "./routes/user.route.js";
import transactionRouter from "./routes/transaction.route.js";

//routes declartion

app.use("/api/v1/user", userRouter);
app.use("/api/v1/transaction", transactionRouter);

export { app };
