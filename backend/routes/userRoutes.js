const express = require("express");
const { updateName, changePassword } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/name", protect, updateName);
router.put("/password", protect, changePassword);

module.exports = router;