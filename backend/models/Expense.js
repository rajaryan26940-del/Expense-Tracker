const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },
    isRecurring: {
  type: Boolean,
  default: false,
},

recurringType: {
  type: String,
  enum: ["Monthly", "Weekly", "Yearly"],
  default: "Monthly",
},
lastProcessed: {
  type: Date,
  default: Date.now,
},

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", expenseSchema);