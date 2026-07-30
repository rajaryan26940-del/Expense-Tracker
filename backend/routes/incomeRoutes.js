const express = require("express");
const router = express.Router();

const {
  addIncome,
  getIncome,
  deleteIncome,
  updateIncome,
} = require("../controllers/incomeController");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addIncome);
router.get("/", protect, getIncome);
router.delete("/:id", protect, deleteIncome);
router.put("/:id", protect, updateIncome);

module.exports = router;