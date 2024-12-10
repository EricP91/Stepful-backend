require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection
const testConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log(
      "Database connected successfully. Current time:",
      res.rows[0].now
    );
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  }
};

// Run the test
testConnection();

module.exports = pool;
