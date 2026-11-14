const express = require("express");
const {
  updateStepProgress,
  addWeeklyUpdate,
  getProgress,
  getAllProgress,
} = require("../controllers/progress.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", getAllProgress);
router.get("/:roadmapId", getProgress);
router.post("/:roadmapId/step", updateStepProgress);
router.post("/:roadmapId/weekly-update", addWeeklyUpdate);

module.exports = router;
