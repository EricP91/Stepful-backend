const express = require("express");
const {
  login,
  logout,
  getUsersByRole,
} = require("../controllers/usersController");
const { scheduleSessionByCoach } = require("../controllers/slotsController");

const router = express.Router();

router.post("/auth/login", login);

router.post("/auth/logout", logout);

router.get("/users/:role", getUsersByRole);

router.post("/slots", scheduleSessionByCoach);

module.exports = router;