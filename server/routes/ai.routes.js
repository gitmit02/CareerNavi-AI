const express = require("express");
const { getUsage } = require("../controllers/ai.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();
router.use(protect);
router.get("/usage", getUsage);

module.exports = router;
