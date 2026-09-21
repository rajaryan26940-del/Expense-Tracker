const express = require("express");
const { updateName, changePassword, updateProfilePicture } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../config/multer");

const router = express.Router();

router.put("/name", protect, updateName);
router.put("/password", protect, changePassword);
router.put("/avatar", protect, upload.single("profilePicture"), updateProfilePicture);

module.exports = router;