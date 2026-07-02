const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
require("dotenv").config();

console.log("PORT:", process.env.PORT);

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

connectDB();

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Expense Tracker Backend is Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});