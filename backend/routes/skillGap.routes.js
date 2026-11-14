const express = require("express");
const { analyzeSkillGap } = require("../controllers/skillGap.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/analyze", analyzeSkillGap);

module.exports = router;
