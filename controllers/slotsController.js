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
      INSERT INTO slots (coach_id, start_time)
      VALUES ${slotsValues
        .map(
          (slotsValue) => `(${slotsValue.coachId}, '${slotsValue.startTime}')`
        )
        .join(", ")}
    `;

    const result = await pool.query(query);
    res.status(201).json({
      message: "Slot stored successfully",
      data: result.rows.map((slot) => ({
        slotId: slot.slot_id,
        coachId: slot.coach_id,
        startTime: slot.start_time,
      })),
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
      WHERE coach_id = $1
    `;
    const values = [userId];
    const result = await pool.query(query, values);

    res.status(200).json({
      message: "Slots retrieved successfully",
      data: sortSlots(result.rows).map((slot) => ({
        slotId: slot.slot_id,
        coachId: slot.coach_id,
        startTime: slot.start_time,
        bookedBy: slot.booked_by,
        courseInfo: slot.course_info,
      })),
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
      WHERE booked_by = $1
    `;
    const values = [userId];
    const result = await pool.query(query, values);

    res.status(200).json({
      message: "Slots retrieved successfully",
      data: sortSlots(result.rows).map((slot) => ({
        slotId: slot.slot_id,
        coachId: slot.coach_id,
        startTime: slot.start_time,
        bookedBy: slot.booked_by,
        courseInfo: slot.course_info,
      })),
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
    SELECT s.slot_id, s.start_time, b.phone_number AS student_phone_number, u.phone_number AS coach_phone_number, b.user_name AS booked_by_name, u.user_name AS user_name, r.score, r.notes, s.course_info
    FROM slots s
    INNER JOIN users u ON s.coach_id = u.user_id
    LEFT JOIN users b ON s.booked_by = b.user_id
    LEFT JOIN reviews r ON s.slot_id = r.slot_id
    WHERE u.user_id = $1 AND s.start_time = $2;
  `;
  const values = [coachId, startTime];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No matching slots found" });
    }
    const slotInfo = result.rows[0];

    res.status(200).json({
      id: slotInfo.slot_id,
      startTime: slotInfo.start_time,
      studentPhoneNumber: slotInfo.student_phone_number,
      coachPhoneNumber: slotInfo.coach_phone_number,
      bookedByName: slotInfo.booked_by_name,
      userName: slotInfo.user_name,
      score: slotInfo.score,
      notes: slotInfo.notes,
      courseInfo: slotInfo.course_info,
    });
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
      SET booked_by = $1
      WHERE slot_id = $2
      RETURNING *;
    `;
    const updateResult = await pool.query(updateQuery, [studentId, slotId]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.status(200).json({
      message: "Slot booked successfully",
      slot: {
        slotId: updateResult.rows[0].slot_id,
        coachId: updateResult.rows[0].coach_id,
        startTime: updateResult.rows[0].start_time,
        bookedBy: updateResult.rows[0].booked_by,
        courseInfo: updateResult.rows[0].course_info,
      },
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
    INSERT INTO reviews (slot_id, score, notes) VALUES ($1, $2, $3)
    RETURNING *;`;
    const result = await pool.query(insertQuery, [slotId, score, notes]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "reviews not found" });
    }

    res.status(200).json({
      message: "Leave feedback successfully",
      slot: {
        slotId: result.rows[0].slot_id,
        score: result.rows[0].score,
        notes: result.rows[0].notes,
      },
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
