import { User } from "../models/user.model.js";
import { TransactionList } from "../models/transactionList.model.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const createTransaction = async (req, res) => {
  const { user1Phone, user2Phone, amount, transactionType, description } =
    req.body;

  try {
    const user1 = await User.findOne({ phoneNumber: user1Phone });
    if (!user1) throw new ApiError(404, "User1 not found");

    let user2 = await User.findOne({ phoneNumber: user2Phone });
    if (!user2) {
      user2 = new User({
        phoneNumber: user2Phone,
        name: "System User",
        systemCreated: true,
      });
      await user2.save();
    }

    // Check for TransactionList
    let transactionList = await TransactionList.findOne({
      _id: { $in: user1.transactionList },
      $or: [
        { user1: user1._id, user2: user2._id },
        { user1: user2._id, user2: user1._id },
      ],
    });

    if (!transactionList) {
      transactionList = new TransactionList({
        user1: user1._id,
        user2: user2._id,
        transactions: [],
      });
      await transactionList.save();

      user1.transactionList.push(transactionList._id);
      user2.transactionList.push(transactionList._id);
      await user1.save();
      await user2.save();
    }

    // Create a new Transaction
    const newTransaction = new Transaction({
      sender: user1._id,
      receiver: user2._id,
      transactionType,
      amount,
      description,
    });
    await newTransaction.save();

    transactionList.transactions.push(newTransaction._id);
    await transactionList.save();

    res
      .status(201)
      .json(
        new ApiResponse(201, newTransaction, "Transaction created successfully")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statuscode).json(error);
    } else {
      res.status(500).json(new ApiError(500, "Server error", [error.message]));
    }
  }
};
// Update Transaction
export const updateTransaction = async (req, res) => {
  const { transactionId, amount, description, isApprovedByReceiver } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    transaction.amount = amount || transaction.amount;
    transaction.description = description || transaction.description;
    transaction.isApprovedByReceiver =
      isApprovedByReceiver !== undefined
        ? isApprovedByReceiver
        : transaction.isApprovedByReceiver;
    transaction.lastUpdatedDate = Date.now();

    await transaction.save();
    res
      .status(200)
      .json({ message: "Transaction updated successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Transaction
export const deleteTransaction = async (req, res) => {
  const { transactionListId, transactionId } = req.body;

  try {
    // Find the TransactionList
    const transactionList = await TransactionList.findById(transactionListId);
    if (!transactionList) throw new ApiError(404, "Transaction list not found");

    // Check if the transaction exists in the transaction list
    if (!transactionList.transactions.includes(transactionId)) {
      throw new ApiError(404, "Transaction not found in the provided list");
    }

    // Remove the transaction from the TransactionList
    transactionList.transactions.pull(transactionId);
    await transactionList.save();

    // Delete the transaction
    await Transaction.findByIdAndDelete(transactionId);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Transaction deleted successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statuscode).json(error);
    } else {
      res.status(500).json(new ApiError(500, "Server error", [error.message]));
    }
  }
};

// Approve Transaction
export const approveTransaction = async (req, res) => {
  const { transactionId } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    transaction.isApprovedByReceiver = true;
    transaction.lastUpdatedDate = Date.now();

    await transaction.save();
    res.status(200).json({ message: "Transaction approved", transaction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllTransactions = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Find the user by their phone number
    const user = await User.findOne({ phoneNumber }).populate(
      "transactionList"
    );
    if (!user) throw new ApiError(404, "User not found");

    // Get all the transaction lists associated with the user
    const transactionLists = await TransactionList.find({
      _id: { $in: user.transactionList },
    }).populate({
      path: "transactions",
      model: "Transaction",
    });

    if (!transactionLists || transactionLists.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No transactions found"));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          transactionLists,
          "Transaction lists retrieved successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statuscode).json(error);
    } else {
      res.status(500).json(new ApiError(500, "Server error", [error.message]));
    }
  }
};
