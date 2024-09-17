import express from "express";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction,
  getAllTransactions,
} from "../controllers/transaction.controller.js";
const transactionRouter = express.Router();

// Route to create a new transaction
transactionRouter.post("/create", createTransaction);

// Route to update an existing transaction
transactionRouter.put("/update", updateTransaction);

// Route to delete a transaction
transactionRouter.delete("/delete", deleteTransaction);

// Route to approve a transaction
transactionRouter.put("/approve", approveTransaction);

transactionRouter.get("/fetch-all", getAllTransactions);

export default transactionRouter;
