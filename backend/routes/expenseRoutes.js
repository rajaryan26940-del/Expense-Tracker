const express = require("express");
const router = express.Router();

const {
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
} = require("../controllers/expenseController");
const upload = require("../config/multer");
const { protect } = require("../middleware/authMiddleware");

router.post(
  "/add",
  protect,
  upload.single("receipt"),
  addExpense
);
router.get("/", protect, getExpenses);
router.delete("/:id", protect, deleteExpense);
router.put(
  "/:id",
  protect,
  upload.single("receipt"),
  updateExpense
);

module.exports = router;