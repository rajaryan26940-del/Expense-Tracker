const Expense = require("../models/Expense");
const cloudinary = require("../config/cloudinary");
const processRecurringExpenses = async (userId) => {
  const recurringExpenses = await Expense.find({
    user: userId,
    isRecurring: true,
  });

  console.log(
    "Recurring Expenses:",
    recurringExpenses.length
  );
};
const addExpense = async (req, res) => {
  try {
const {
  title,
  amount,
  category,
  isRecurring,
  recurringType,
} = req.body;
let receiptUrl = "";

if (req.file) {
  const uploadedImage = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
    {
      folder: "expense-receipts",
    }
  );

  receiptUrl = uploadedImage.secure_url;
}
if (!title || title.trim() === "") {
  return res.status(400).json({
    message: "Please enter an expense name",
  });
}
if (amount === undefined || amount === null || amount === "") {
  return res.status(400).json({
    message: "Please enter an amount",
  });
}
if (Number.isNaN(Number(amount))) {
  return res.status(400).json({
    message: "Please enter a valid amount",
  });
}
if (Number(amount) <= 0) {
  return res.status(400).json({
    message: "Amount must be greater than 0",
  });
}
if (!category || category.trim() === "") {
  return res.status(400).json({
    message: "Please select a category",
  });
}
const userId = req.user._id;
const expense = new Expense({
  title,
  amount,
  category,
  receipt: receiptUrl,
  isRecurring,
  recurringType,
  user: userId,
});
await expense.save();
res.status(201).json({
  message: "Expense Added Successfully",
  expense,
});
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
// Get All Expenses
const getExpenses = async (req, res) => {
  try {
 const expenses = await Expense.find({
  user: req.user._id,
}).sort({ createdAt: -1 });
  res.status(200).json({
  expenses,
});
} catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
const deleteExpense = async (req, res) => {
  try {
  const expenseId = req.params.id;
  const expense = await Expense.findById(expenseId);
  if (!expense) {
  return res.status(404).json({
    message: "Expense not found",
  });
}
if (expense.user.toString() !== req.user._id.toString()) {
  return res.status(401).json({
    message: "Unauthorized",
  });
}
await expense.deleteOne();
res.status(200).json({
  message: "Expense deleted successfully",
});
} catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
// Update Expense
const updateExpense = async (req, res) => {
  try {
  const expenseId = req.params.id;

  const {
  title,
  amount,
  category,
  isRecurring,
  recurringType,
} = req.body;
  if (!title || title.trim() === "") {
  return res.status(400).json({
    message: "Please enter an expense name",
  });
}

if (amount === undefined || amount === null || amount === "") {
  return res.status(400).json({
    message: "Please enter an amount",
  });
}

if (Number.isNaN(Number(amount))) {
  return res.status(400).json({
    message: "Please enter a valid amount",
  });
}

if (Number(amount) <= 0) {
  return res.status(400).json({
    message: "Amount must be greater than 0",
  });
}

if (!category || category.trim() === "") {
  return res.status(400).json({
    message: "Please select a category",
  });
}
  const expense = await Expense.findById(expenseId);
  if (!expense) {
  return res.status(404).json({
    message: "Expense not found",
  });
}
if (expense.user.toString() !== req.user._id.toString()) {
  return res.status(401).json({
    message: "Unauthorized",
  });
}
let receiptUrl = expense.receipt;

if (req.file) {
  const uploadedImage = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
    {
      folder: "expense-receipts",
    }
  );

  receiptUrl = uploadedImage.secure_url;
}
expense.title = title;
expense.amount = amount;
expense.category = category;
expense.isRecurring = isRecurring;
expense.recurringType = recurringType;
expense.receipt = receiptUrl;
await expense.save();
res.status(200).json({
  message: "Expense updated successfully",
  expense,
});
}catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
};