const Income = require("../models/Income");

// Add Income
const addIncome = async (req, res) => {
  try {
    const { title, amount, source } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Please enter an income title",
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

    if (!source || source.trim() === "") {
      return res.status(400).json({
        message: "Please enter an income source",
      });
    }

    const income = new Income({
      title,
      amount,
      source,
      user: req.user._id,
    });

    await income.save();

    res.status(201).json({
      message: "Income added successfully",
      income,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
// Get All Income
const getIncome = async (req, res) => {
  try {
    const income = await Income.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      income,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
// Delete Income
const deleteIncome = async (req, res) => {
  try {
    const incomeId = req.params.id;

    const income = await Income.findById(incomeId);

    if (!income) {
      return res.status(404).json({
        message: "Income not found",
      });
    }

    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    await income.deleteOne();

    res.status(200).json({
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
// Update Income
const updateIncome = async (req, res) => {
  try {
    const incomeId = req.params.id;

    const { title, amount, source } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Please enter an income title",
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

    if (!source || source.trim() === "") {
      return res.status(400).json({
        message: "Please enter an income source",
      });
    }

    const income = await Income.findById(incomeId);

    if (!income) {
      return res.status(404).json({
        message: "Income not found",
      });
    }

    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    income.title = title;
    income.amount = amount;
    income.source = source;

    await income.save();

    res.status(200).json({
      message: "Income updated successfully",
      income,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  addIncome,
  getIncome,
  deleteIncome,
  updateIncome,
};