const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

console.log("PORT:", process.env.PORT);

const connectDB = require("./config/db");
const processRecurringExpenses = require("./jobs/recurringExpenseJob");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const userRoutes = require("./routes/userRoutes");

connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Expense Tracker Backend is Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
cron.schedule("* * * * *", async () => {
  console.log("Running recurring expense job...");

  await processRecurringExpenses();
});