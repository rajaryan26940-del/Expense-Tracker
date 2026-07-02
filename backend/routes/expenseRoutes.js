const express = require("express");
const router = express.Router();

const {
  addExpense,
  getExpenses,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addExpense);
router.get("/", protect, getExpenses);

module.exports = router;