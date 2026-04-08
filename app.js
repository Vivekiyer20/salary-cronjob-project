const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// -----------------------------
// 🔌 DATABASE CONNECTION
// -----------------------------
const pool = new Pool({
  user: "admin",
  host: "postgres", // IMPORTANT: Kubernetes service name
  database: "salary_db",
  password: "admin",
  port: 5432,
});

// -----------------------------
// 💰 SALARY CALCULATION LOGIC
// -----------------------------
function calculateEarnings(distance, peak) {
  let base = 50;
  let distancePay = distance * 10;
  let bonus = peak ? 30 : 0;
  let penalty = distance < 3 ? -20 : 0;

  return base + distancePay + bonus + penalty;
}

// -----------------------------
// 📦 ADD DELIVERY API
// -----------------------------
app.post("/delivery", async (req, res) => {
  const { partner_id, distance, peak } = req.body;

  // Validation
  if (!partner_id || distance === undefined || peak === undefined) {
    return res.status(400).json({
      error: "partner_id, distance and peak are required",
    });
  }

  const earnings = calculateEarnings(distance, peak);

  try {
    await pool.query(
      "INSERT INTO deliveries (partner_id, distance, earnings, peak) VALUES ($1, $2, $3, $4)",
      [partner_id, distance, earnings, peak]
    );

    res.json({
      message: "Delivery added successfully",
      earnings: earnings,
    });
  } catch (err) {
    console.error("DB Insert Error:", err);
    res.status(500).send("Error inserting data");
  }
});

// -----------------------------
// 📊 GET ALL DELIVERIES
// -----------------------------
app.get("/delivery", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM deliveries ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("DB Fetch Error:", err);
    res.status(500).send("Error fetching data");
  }
});

// -----------------------------
// 🧮 SALARY CALCULATION API (FOR CRONJOB)
// -----------------------------
app.get("/calculate-salary", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT partner_id, SUM(earnings) as total_earnings
       FROM deliveries
       GROUP BY partner_id`
    );

    res.json({
      message: "Salary calculated successfully",
      data: result.rows,
    });
  } catch (err) {
    console.error("Salary Calculation Error:", err);
    res.status(500).send("Error calculating salary");
  }
});

// -----------------------------
// ❤️ HEALTH CHECK
// -----------------------------
app.get("/health", (req, res) => {
  res.send("OK");
});

// -----------------------------
// 🚀 START SERVER
// -----------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
