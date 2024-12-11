const express = require("express");
const {
  scheduleSessionByCoach,
  getSlotsByCoach,
  getSlotDetailByCoachAndTime,
	bookSession,
} = require("../controllers/slotsController");

const slotsRouter = express.Router();

slotsRouter.post("/slots", scheduleSessionByCoach);

slotsRouter.post("/slots/book", bookSession);

slotsRouter.get("/slots/:user_name", getSlotsByCoach);

slotsRouter.get("/slot", getSlotDetailByCoachAndTime);

module.exports = slotsRouter;
