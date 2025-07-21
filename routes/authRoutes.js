const express = require("express");
const { register, login, getProfile,getFilteredUsers,getAdvancedFilteredUsers } = require("../controllers/authController");
const upload = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", upload.single("image"), register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.get("/filtered-users", authMiddleware, getFilteredUsers)
router.post("/filtered-advanced-users", authMiddleware, getAdvancedFilteredUsers)

module.exports = router;
