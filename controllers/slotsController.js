const pool = require("../config/database");
const { findUserIdByName } = require("./usersController");
const { sortSlots } = require("../utils");

const scheduleSessionByCoach = async (req, res) => {
  const { userName, slots } = req.body;

  if (!userName || !slots) {
    return res.status(400).json({ message: "Username and slots are required" });
  }

  try {
    const coachId = await findUserIdByName(userName);
    if (!coachId) {
      return res.status(404).json({ message: "User not found" });
    }

    const slotsValues = slots.map((slot) => ({
      coachId: coachId,
      startTime: slot,
    }));

    const query = `
      INSERT INTO slots (coachId, startTime)
      VALUES ${slotsValues
        .map(
          (slotsValue) => `(${slotsValue.coachId}, '${slotsValue.startTime}')`
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
  const { userName } = req.params;

  if (!userName) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const userId = await findUserIdByName(userName);
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    const query = `
      SELECT * FROM slots
      WHERE coachId = $1
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
  const { userName } = req.params;

  if (!userName) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const userId = await findUserIdByName(userName);
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    const query = `
      SELECT * FROM slots
      WHERE bookedBy = $1
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
    SELECT s.id, s.startTime, b.phoneNumber AS studentPhoneNumber, u.phoneNumber AS coachPhoneNumber, b.userName AS bookedByName, u.userName, r.score, r.notes, s.courseInfo
    FROM slots s
    INNER JOIN users u ON s.coachId = u.userId
    LEFT JOIN users b ON s.bookedyId = b.userId
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
  const { userName, slotId } = req.body;

  if (!userName || !slotId) {
    return res.status(400).json({ message: "slotId and userId are required" });
  }

  try {
    const studentId = await findUserIdByName(userName);
    if (!studentId) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateQuery = `
      UPDATE slots
      SET bookedBy = $1
      WHERE id = $2
      RETURNING *;
    `;
    const updateResult = await pool.query(updateQuery, [studentId, slotId]);

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
  const { slotId, score, notes } = req.body;

  if (!slotId) {
    return res.status(400).json({ message: "slotId are required" });
  }

  try {
    const insertQuery = `
    INSERT INTO reviews (slotId, score, notes) VALUES ($1, $2, $3)
    RETURNING *;`;
    const result = await pool.query(insertQuery, [slotId, score, notes]);

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
