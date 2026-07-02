const express = require("express");
const router = express.Router();

const { addExpense } = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addExpense);

module.exports = router;