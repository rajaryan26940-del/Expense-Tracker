const express = require("express");
const router = express.Router();

const {
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addExpense);
router.get("/", protect, getExpenses);
router.delete("/:id", protect, deleteExpense);
router.put("/:id", protect, updateExpense);

module.exports = router;