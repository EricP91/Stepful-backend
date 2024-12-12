const express = require("express");
const {
  scheduleSessionByCoach,
  getSlotsByCoach,
  getSlotsByStudent,
  getSlotDetailByCoachAndTime,
	bookSession,
  leaveFeedback
} = require("../controllers/slotsController");

const slotsRouter = express.Router();

slotsRouter.post("/slots", scheduleSessionByCoach);

slotsRouter.post("/slots/book", bookSession);

slotsRouter.post("/calls/feedback", leaveFeedback);

slotsRouter.get("/slots/:user_name", getSlotsByCoach);
slotsRouter.get("/slots/booked/:user_name", getSlotsByStudent);

slotsRouter.get("/slot", getSlotDetailByCoachAndTime);


module.exports = slotsRouter;
