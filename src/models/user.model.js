import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    transactionList: [
      {
        type: Schema.Types.ObjectId,
        ref: "TransactionList",
      },
    ],
    accessToken: {
      type: String,
    },
    systemCreated: {
      type: Boolean,
      default: false,
    },
  },
  { timeseries: true }
);

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      phoneNumber: this.phoneNumber,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
