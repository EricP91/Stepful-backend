const express = require("express");
const { scheduleSessionByCoach, getSlotsByCoach, getSlotsByCoachAndTime } = require("../controllers/slotsController");

const router = express.Router();

router.post("/slots", scheduleSessionByCoach);
router.get("/slots/:user_name", getSlotsByCoach);
router.get("/slot", getSlotsByCoachAndTime);

module.exports = router;
