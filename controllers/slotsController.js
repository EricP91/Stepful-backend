const pool = require("../config/database");
const { findUserIdByName } = require("./usersController");
const { sortSlots } = require("../utils");

const scheduleSessionByCoach = async (req, res) => {
  const { user_name, slots } = req.body;

  if (!user_name || !slots) {
    return res.status(400).json({ message: "Username and slots are required" });
  }

  try {
    const coachId = await findUserIdByName(user_name);
    if (!coachId) {
      return res.status(404).json({ message: "User not found" });
    }

    const slotsValues = slots.map((slot) => ({
      coach_id: coachId,
      start_time: slot,
    }));

    const query = `
      INSERT INTO slots (coach_id, start_time)
      VALUES ${slotsValues
        .map(
          (slotsValue) => `(${slotsValue.coach_id}, '${slotsValue.start_time}')`
        )
        .join(", ")}
    `;

    const result = await pool.query(query);
    res.status(201).json({
      message: "Slot stored successfully",
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getSlotsByCoach = async (req, res) => {
  const { user_name } = req.params;

  if (!user_name) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const userId = await findUserIdByName(user_name);
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    const query = `
      SELECT * FROM slots
      WHERE coach_id = $1
    `;
    const values = [userId];
    const result = await pool.query(query, values);

    res.status(200).json({
      message: "Slots retrieved successfully",
      data: sortSlots(result.rows),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getSlotsByStudent = async (req, res) => {
  const { user_name } = req.params;

  if (!user_name) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const userId = await findUserIdByName(user_name);
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    const query = `
      SELECT * FROM slots
      WHERE booked_by = $1
    `;
    const values = [userId];
    const result = await pool.query(query, values);

    res.status(200).json({
      message: "Slots retrieved successfully",
      data: sortSlots(result.rows),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getSlotDetailByCoachAndTime = async (req, res) => {
  const { coachId, startTime } = req.query;

  if (!coachId || !startTime) {
    return res
      .status(400)
      .json({ message: "coachId and startTime are required" });
  }

  const query = `
    SELECT s.id, s.start_time, b.phone_number AS student_phone_number, u.phone_number AS coach_phone_number, b.user_name AS booked_by_name, u.user_name, r.score, r.notes, s.course_info
    FROM slots s
    INNER JOIN users u ON s.coach_id = u.user_id
    LEFT JOIN users b ON s.booked_by = b.user_id
    LEFT JOIN reviews r ON s.id = r.slot_id
    WHERE u.user_id = $1 AND s.start_time = $2;
  `;
  const values = [coachId, startTime];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No matching slots found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching slots:", error.message);
    throw new Error("Failed to fetch slots");
  }
};

const bookSession = async (req, res) => {
  const { user_name, slot_id } = req.body;

  if (!user_name || !slot_id) {
    return res.status(400).json({ message: "slotId and userId are required" });
  }

  try {
    const studentId = await findUserIdByName(user_name);
    if (!studentId) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateQuery = `
      UPDATE slots
      SET booked_by = $1
      WHERE id = $2
      RETURNING *;
    `;
    const updateResult = await pool.query(updateQuery, [studentId, slot_id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.status(200).json({
      message: "Slot booked successfully",
      slot: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error booking slot:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const leaveFeedback = async (req, res) => {
  const { slot_id, score, notes } = req.body;

  if (!slot_id) {
    return res.status(400).json({ message: "slotId are required" });
  }

  try {
    const insertQuery = `
    INSERT INTO reviews (slot_id, score, notes) VALUES ($1, $2, $3)
    RETURNING *;`;
    const result = await pool.query(insertQuery, [slot_id, score, notes]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "reviews not found" });
    }

    res.status(200).json({
      message: "Leave feedback successfully",
      slot: result.rows[0],
    });
  } catch (error) {
    console.error("Error booking slot:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  scheduleSessionByCoach,
  getSlotsByStudent,
  getSlotDetailByCoachAndTime,
  getSlotsByCoach,
  bookSession,
  leaveFeedback,
};
