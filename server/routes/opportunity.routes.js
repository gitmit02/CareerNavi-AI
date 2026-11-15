const express = require("express");
const { search, getRoles, getOne, analyze } = require("../controllers/opportunity.controller");
const { protect } = require("../middlewares/auth.middleware");
const { aiLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();
router.use(protect);

router.get("/roles", getRoles);
router.get("/search", search);
router.get("/:id", getOne);
router.post("/:id/analyze", aiLimiter, analyze);

module.exports = router;
