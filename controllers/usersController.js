const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM public.users WHERE user_name = $1",
      [username]
    );
    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = user.password === password;
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000 * 2,
    });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const findUserById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT user_name, user_role, phone_number FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const findUserByName = async (username) => {
  const query = `SELECT user_id FROM users WHERE user_name = $1`;
  const values = [username];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      return result.rows[0].user_id;
    }
    return null;
  } catch (error) {
    console.error("Error finding user:", error.message);
    throw new Error("Database query failed");
  }
};


const logout = (req, res) => {
  res.json({ message: "Logout successful" });
};

module.exports = {
  login,
  findUserById,
  findUserByName,
  logout,
};