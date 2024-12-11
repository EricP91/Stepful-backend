const express = require("express");
const slotsRoutes = require("./slotsRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use(slotsRoutes);
router.use(userRoutes);

module.exports = router;