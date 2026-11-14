const express = require("express");
const {
  generateRoadmap,
  getRoadmaps,
  getRoadmapById,
} = require("../controllers/roadmap.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/generate", generateRoadmap);
router.get("/", getRoadmaps);
router.get("/:id", getRoadmapById);

module.exports = router;
