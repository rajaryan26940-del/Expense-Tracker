import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseChart from "../components/ExpenseChart";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
} from "../services/expenseService";

function Dashboard() {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [isRecurring, setIsRecurring] = useState(false);

const [recurringType, setRecurringType] =
  useState("Monthly");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editId, setEditId] = useState(null);
  const [sortOption, setSortOption] = useState("latest");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
  const savedBudget = localStorage.getItem("monthlyBudget");
  return savedBudget ? Number(savedBudget) : 10000;
});
const [editingBudget, setEditingBudget] = useState(false);

const [budgetInput, setBudgetInput] = useState(monthlyBudget);
 const [darkMode, setDarkMode] = useState(
  localStorage.getItem("darkMode") === "true");
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  function handleThemeToggle() {
  const newDarkMode = !darkMode;

  setDarkMode(newDarkMode);
  localStorage.setItem("darkMode", newDarkMode);
}
  function handleLogout() {
  const confirmLogout = window.confirm(
    "Are you sure you want to logout?"
  );

  if (!confirmLogout) {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("name");

  alert("Logout Successful!");

  navigate("/");
}
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data.expenses);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);
useEffect(() => {
  const hasUnsavedChanges =
    editId ||
    (showForm &&
      !editId &&
      (expenseName.trim() !== "" ||
        String(amount).trim() !== ""));

  const handleBeforeUnload = (event) => {
    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = "";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [editId, showForm, expenseName, amount]);
  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch = expense.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        filterCategory === "All" ||
        expense.category === filterCategory;

      const matchesMonth =
        selectedMonth === "All" ||
        new Date(
          expense.updatedAt || expense.createdAt
        ).toLocaleString("default", {
          month: "long",
        }) === selectedMonth;

      return matchesSearch && matchesCategory && matchesMonth;
    })
    .sort((a, b) => {
      if (sortOption === "highest") {
        return Number(b.amount) - Number(a.amount);
      }

      if (sortOption === "lowest") {
        return Number(a.amount) - Number(b.amount);
      }

      return (
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
      );
    });

  const totalExpense = filteredExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const totalEntries = filteredExpenses.length;

  const highestExpense =
    filteredExpenses.length > 0
      ? Math.max(
          ...filteredExpenses.map((expense) =>
            Number(expense.amount)
          )
        )
      : 0;
      const lowestExpense =
  filteredExpenses.length > 0
    ? Math.min(
        ...filteredExpenses.map((expense) =>
          Number(expense.amount)
        )
      )
    : 0;
    const averageExpense =
  totalEntries > 0
    ? Math.round(totalExpense / totalEntries)
    : 0;
    const remainingBudget = monthlyBudget - totalExpense;

const budgetUsedPercentage = Math.min(
  (totalExpense / monthlyBudget) * 100,
  100
);
const categoryTotals = {};

filteredExpenses.forEach((expense) => {
  const category = expense.category;

  categoryTotals[category] =
    (categoryTotals[category] || 0) +
    Number(expense.amount);
});
let topCategory = "N/A";
let topCategoryAmount = 0;

Object.entries(categoryTotals).forEach(
  ([category, total]) => {
    if (total > topCategoryAmount) {
      topCategory = category;
      topCategoryAmount = total;
    }
  }
);
const currentDate = new Date();

const thisMonthExpense = filteredExpenses.reduce(
  (total, expense) => {
    const expenseDate = new Date(
      expense.updatedAt || expense.createdAt
    );

    const isCurrentMonth =
      expenseDate.getMonth() === currentDate.getMonth() &&
      expenseDate.getFullYear() === currentDate.getFullYear();

    if (isCurrentMonth) {
      return total + Number(expense.amount);
    }

    return total;
  },
  0
);
const lastMonthExpense = filteredExpenses.reduce(
  (total, expense) => {
    const expenseDate = new Date(
      expense.updatedAt || expense.createdAt
    );

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;

    if (previousMonth < 0) {
      previousMonth = 11;
      previousYear--;
    }

    const isLastMonth =
      expenseDate.getMonth() === previousMonth &&
      expenseDate.getFullYear() === previousYear;

    if (isLastMonth) {
      return total + Number(expense.amount);
    }

    return total;
  },
  0
);
const expenseDifference =
  thisMonthExpense - lastMonthExpense;

const expenseTrend =
  expenseDifference >= 0 ? "Increase" : "Decrease";
  const currentDay = currentDate.getDate();

const averageDailySpending =
  currentDay > 0
    ? Math.round(thisMonthExpense / currentDay)
    : 0;
const dailyTotals = {};

filteredExpenses.forEach((expense) => {
  const date = new Date(
    expense.updatedAt || expense.createdAt
  ).toLocaleDateString();

  dailyTotals[date] =
    (dailyTotals[date] || 0) +
    Number(expense.amount);
});
let highestSpendingDay = "N/A";
let highestDayAmount = 0;

Object.entries(dailyTotals).forEach(
  ([date, total]) => {
    if (total > highestDayAmount) {
      highestSpendingDay = date;
      highestDayAmount = total;
    }
  }
);
      function handleResetFilters() {
  setSearch("");
  setFilterCategory("All");
  setSelectedMonth("All");
  setSortOption("latest");
}
     function handleToggleForm() {
  if (showForm && editId) {
    const confirmClose = window.confirm(
      "Are you sure you want to close editing?"
    );

    if (!confirmClose) {
      return;
    }
  }
  if (
  showForm &&
  !editId &&
  (expenseName.trim() !== "" || amount.trim() !== "")
) {
  const confirmClose = window.confirm(
    "Are you sure you want to discard this expense?"
  );

  if (!confirmClose) {
    return;
  }
}

  if (showForm) {
    setExpenseName("");
    setAmount("");
    setCategory("Food");
    setEditId(null);
  }

  setShowForm(!showForm);
}

  async function handleSaveExpense() {
  if (expenseName.trim() === "") {
  alert("Please enter Expense Name");
  return;
}
    if (String(amount).trim() === "") {
      alert("Please enter Amount");
      return;
    }
if (Number(amount) <= 0) {
  alert("Amount must be greater than 0");
  return;
}
    try {
      setSaving(true);
      const expenseData = {
  title: expenseName,
  amount: amount,
  category: category,
  isRecurring,
  recurringType,
};

      if (editId) {
        const data = await updateExpense(editId, expenseData);

        setExpenses(
          expenses.map((expense) =>
            expense._id === editId ? data.expense : expense
          )
        );

        setEditId(null);
        alert("Expense updated successfully!");
      } else {
        const data = await addExpense(expenseData);

        setExpenses([data.expense, ...expenses]);
        alert("Expense added successfully!");
      }

     setExpenseName("");
setAmount("");
setCategory("Food");
setIsRecurring(false);
setRecurringType("Monthly");
setShowForm(false);
    } catch (error) {
  console.log(error);
  alert(
    error.response?.data?.message ||
      "Failed to save expense"
  );
} finally {
  setSaving(false);
}
  }

  async function handleDeleteExpense(id) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this expense?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    setDeletingId(id);
    await deleteExpense(id);

    setExpenses(
      expenses.filter((expense) => expense._id !== id)
    );
    alert("Expense deleted successfully!");
    
  } catch (error) {
    console.log(error);
    alert(
      error.response?.data?.message ||
        "Failed to delete expense"
    );
  } finally {
  setDeletingId(null);
}
}
  function handleEditExpense(expense) {
  if (editId && editId !== expense._id) {
    const confirmSwitch = window.confirm(
      "You have unsaved changes. Are you sure you want to edit another expense?"
    );

    if (!confirmSwitch) {
      return;
    }
  }

  setExpenseName(expense.title);
  setAmount(expense.amount);
  setCategory(expense.category);
  setEditId(expense._id);
  setShowForm(true);

  setTimeout(() => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 0);
}

 function handleCancelEdit() {
  const confirmCancel = window.confirm(
    "Are you sure you want to cancel editing?"
  );

  if (!confirmCancel) {
    return;
  }

 setExpenseName("");
setAmount("");
setCategory("Food");
setIsRecurring(false);
setRecurringType("Monthly");
setEditId(null);
setShowForm(false);
}
function handleExportExcel() {
  if (filteredExpenses.length === 0) {
    alert("No expenses available to export.");
    return;
  }

  const exportData = filteredExpenses.map((expense) => ({
    Date: new Date(
      expense.updatedAt || expense.createdAt
    ).toLocaleDateString(),

    Time: new Date(
      expense.updatedAt || expense.createdAt
    ).toLocaleTimeString(),

    "Expense Name": expense.title,
    Amount: expense.amount,
    Category: expense.category,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

worksheet["!cols"] = [
  { wch: 15 }, // Date
  { wch: 15 }, // Time
  { wch: 30 }, // Expense Name
  { wch: 12 }, // Amount
  { wch: 18 }, // Category
];

const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Expenses"
  );

  XLSX.writeFile(workbook, "expenses.xlsx");
}
function handleExportPDF() {
  if (filteredExpenses.length === 0) {
    alert("No expenses available to export.");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Expense Tracker Report", 14, 20);

  doc.setFontSize(11);
  doc.text(
    `Exported On: ${new Date().toLocaleString()}`,
    14,
    30
  );

  doc.text(
    `Total Entries: ${filteredExpenses.length}`,
    14,
    38
  );

 doc.text(
  `Total Expense: Rs. ${totalExpense}`,
  14,
  46
);

  autoTable(doc, {
    startY: 55,
    head: [[
      "Date",
      "Time",
      "Expense Name",
      "Amount",
      "Category",
    ]],
    body: filteredExpenses.map((expense) => [
      new Date(
        expense.updatedAt || expense.createdAt
      ).toLocaleDateString(),

      new Date(
        expense.updatedAt || expense.createdAt
      ).toLocaleTimeString(),

      expense.title,
      `Rs. ${expense.amount}`,
      expense.category,
    ]),
  });

  doc.save("expenses.pdf");
}
  return (
    <div
      className={`dashboard-container ${
        darkMode ? "dark-mode" : "light-mode"
      }`}
    >
      <h1 className="dashboard-title">
        Expense Tracker Dashboard
      </h1>

      <h2 className="dashboard-title">
  Welcome {localStorage.getItem("name")}
</h2>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        Logout
      </button>

      <button
        className="theme-btn"
        onClick={handleThemeToggle}
      >
        {darkMode ? "🌞 Light Mode" : "🌑 Dark Mode"}
      </button>

    <div className="summary-cards">
  <div className="card">
    <h3>Total Expense</h3>
    <p>₹ {totalExpense}</p>
  </div>

  <div className="card">
    <h3>Total Entries</h3>
    <p>{totalEntries}</p>
  </div>

  <div className="card">
    <h3>Highest Expense</h3>
    <p>₹ {highestExpense}</p>
  </div>
  <div className="card">
  <h3>Lowest Expense</h3>
  <p>₹ {lowestExpense}</p>
</div>
<div className="card">
  <h3>Most Expensive Category</h3>

  <p>{topCategory}</p>

  <small
    style={{
      display: "block",
      marginTop: "8px",
      fontSize: "16px",
      color: "#666",
    }}
  >
    ₹ {topCategoryAmount}
  </small>
</div>
<div className="card">
  <h3>This Month's Spending</h3>

  <p>₹ {thisMonthExpense}</p>
</div>
<div className="card">
  <h3>Highest Spending Day</h3>

  <p>{highestSpendingDay}</p>

  <small
    style={{
      display: "block",
      marginTop: "8px",
      fontSize: "16px",
      color: "#666",
    }}
  >
    ₹ {highestDayAmount}
  </small>
</div>
<div className="card">
  <h3>Last Month vs This Month</h3>

  <p>₹ {thisMonthExpense}</p>

  <small
    style={{
      display: "block",
      marginTop: "8px",
      fontSize: "16px",
      color: "#666",
    }}
  >
    Last: ₹ {lastMonthExpense}
  </small>

  <small
    style={{
      display: "block",
      marginTop: "8px",
      fontSize: "16px",
      fontWeight: "bold",
      color:
        expenseTrend === "Increase"
          ? "#dc2626"
          : "#16a34a",
    }}
  >
    {expenseTrend === "Increase"
      ? "📈 Increased"
      : "📉 Decreased"}

    {" "}₹ {Math.abs(expenseDifference)}
  </small>
</div>
<div className="card">
  <h3>Average Daily Spending</h3>

  <p>₹ {averageDailySpending}</p>

  <small
    style={{
      display: "block",
      marginTop: "8px",
      fontSize: "16px",
      color: "#666",
    }}
  >
    Per Day
  </small>
</div>
</div>
<div className="budget-section">
  <h2>Monthly Budget Overview</h2>

  <div className="budget-details">
    <p>
      <strong>Budget:</strong> ₹ {monthlyBudget}
    </p>

    <p>
      <strong>Spent:</strong> ₹ {totalExpense}
    </p>

    <p>
      <strong>Remaining:</strong> ₹ {remainingBudget}
    </p>

    <p>
      <strong>Used:</strong>{" "}
      {budgetUsedPercentage.toFixed(1)}%
    </p>
    <div className="budget-progress">
  <div
  className="budget-progress-fill"
  style={{
    width: `${budgetUsedPercentage}%`,
    backgroundColor:
      budgetUsedPercentage < 70
        ? "#22c55e"
        : budgetUsedPercentage < 100
        ? "#f59e0b"
        : "#ef4444",
  }}
></div>
</div>
{editingBudget ? (
  <div className="budget-edit">
    <input
      type="number"
      value={budgetInput}
      onChange={(e) => setBudgetInput(e.target.value)}
      placeholder="Enter monthly budget"
      className="budget-input"
    />

    <button
      className="change-budget-btn"
      onClick={() => {
        const budget = Number(budgetInput);

        if (isNaN(budget) || budget <= 0) {
          alert("Please enter a valid budget greater than 0.");
          return;
        }

        setMonthlyBudget(budget);
        setBudgetInput(budget);
        localStorage.setItem("monthlyBudget", budget);
        setEditingBudget(false);

        alert("Monthly budget updated successfully!");
      }}
    >
      Save Budget
    </button>

    <button
      className="change-budget-btn"
      onClick={() => {
        setBudgetInput(monthlyBudget);
        setEditingBudget(false);
      }}
    >
      Cancel
    </button>
  </div>
) : (
  <button
    className="change-budget-btn"
    onClick={() => setEditingBudget(true)}
  >
    Edit Budget
  </button>
)}
{remainingBudget >= 0 ? (
  <p
    style={{
      color: "#16a34a",
      fontWeight: "bold",
      marginTop: "12px",
    }}
  >
    ✅ You have ₹ {remainingBudget} remaining this month.
  </p>
) : (
  <p
    style={{
      color: "#dc2626",
      fontWeight: "bold",
      marginTop: "12px",
    }}
  >
    ⚠️ Budget exceeded by ₹ {Math.abs(remainingBudget)}.
  </p>
)}
  </div>
</div>

<ExpenseChart
  expenses={expenses}
  averageExpense={averageExpense}
/>

<button onClick={handleToggleForm}>
  {showForm ? "Close Form" : "Add Expense"}
</button>

      <hr />
{showForm && (
  <div ref={formRef}>
    <ExpenseForm
  expenseName={expenseName}
  setExpenseName={setExpenseName}
  amount={amount}
  setAmount={setAmount}
  category={category}
  setCategory={setCategory}
  isRecurring={isRecurring}
  setIsRecurring={setIsRecurring}
  recurringType={recurringType}
  setRecurringType={setRecurringType}
  handleSaveExpense={handleSaveExpense}
  editId={editId}
  handleCancelEdit={handleCancelEdit}
  saving={saving}
/>
  </div>
)}

      <hr />

      <h2>Recent Expenses</h2>
     <div className="export-buttons">
  <button onClick={handleExportExcel}>
    📊 Export Excel
  </button>

  <button onClick={handleExportPDF}>
    📄 Export PDF
  </button>
</div>

      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
{search && (
  <button onClick={() => setSearch("")}>
    Clear Search
  </button>
)}
        <select
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(e.target.value)
          }
        >
          <option value="All">All Categories</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Others">Others</option>
        </select>

        <select
          value={selectedMonth}
          onChange={(e) =>
            setSelectedMonth(e.target.value)
          }
        >
          <option value="All">All Months</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>

        <select
          value={sortOption}
          onChange={(e) =>
            setSortOption(e.target.value)
          }
        >
          <option value="latest">Latest</option>
          <option value="highest">
            Highest Amount
          </option>
          <option value="lowest">
            Lowest Amount
          </option>
        </select>
        {(search ||
  filterCategory !== "All" ||
  selectedMonth !== "All" ||
  sortOption !== "latest") && (
  <button onClick={handleResetFilters}>
    Reset Filters
  </button>
)}
      </div>

      <br />
      <br />

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Expense Name</th>
            <th>Amount</th>
           <th>Category</th>
<th>Recurring</th>
<th>Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">
                Loading expenses...
              </td>
            </tr>
          ) : filteredExpenses.length === 0 ? (
            <tr>
              <td colSpan="6">
  {expenses.length === 0
    ? "No expenses found."
    : "No matching expenses found."}
</td>
            </tr>
          ) : (
            filteredExpenses.map((expense) => (
              <tr key={expense._id}>
                <td>
                  {new Date(
                    expense.updatedAt ||
                      expense.createdAt
                  ).toLocaleDateString()}
                </td>

                <td>
                  {new Date(
                    expense.updatedAt ||
                      expense.createdAt
                  ).toLocaleTimeString()}
                </td>

                <td>{expense.title}</td>
                <td>₹ {expense.amount}</td>
                <td>{expense.category}</td>

<td>
  {expense.isRecurring ? (
    <span className="recurring-badge">
      🔁 {expense.recurringType}
    </span>
  ) : (
    "-"
  )}
</td>

<td>
                  <button
                    className="edit-btn"
                    onClick={() =>
                      handleEditExpense(expense)
                    }
                  >
                    Edit
                  </button>

                  <button
  className="delete-btn"
  onClick={() =>
    handleDeleteExpense(expense._id)
  }
  disabled={deletingId === expense._id}
>
  {deletingId === expense._id
    ? "Deleting..."
    : "Delete"}
</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>


<h2 className="total-expense">
  Total Expense: ₹ {totalExpense}
</h2>
    </div>
  );
}

export default Dashboard;