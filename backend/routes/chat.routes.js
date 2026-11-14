const express = require("express");
const { askMentor } = require("../controllers/chat.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/ask", askMentor);

module.exports = router;
