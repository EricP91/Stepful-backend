const express = require("express");
const { login, logout } = require("../controllers/usersController");
const { scheduleSessionByCoach } = require("../controllers/slotsController");

const router = express.Router();

// Routes
router.post("/auth/login", login);
router.post("/auth/logout", logout);

router.post("/slots", scheduleSessionByCoach);
module.exports = router;
