const Expense = require("../models/Expense");
const addExpense = async (req, res) => {
  try {
const { title, amount, category } = req.body;
const userId = req.user._id;
const expense = new Expense({
  title,
  amount,
  category,
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
module.exports = { addExpense };