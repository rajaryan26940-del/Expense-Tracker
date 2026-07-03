import { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import ExpenseForm from "../components/ExpenseForm";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
} from "../services/expenseService";

function Dashboard() {
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editId, setEditId] = useState(null);
  const [sortOption, setSortOption] = useState("latest");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

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

  const totalExpense = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const totalEntries = expenses.length;

  const highestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((expense) => Number(expense.amount)))
      : 0;

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

      return 0;
    });

  async function handleSaveExpense() {
    if (expenseName === "") {
      alert("Please enter Expense Name");
      return;
    }

    if (amount === "") {
      alert("Please enter Amount");
      return;
    }

    try {
      const expenseData = {
        title: expenseName,
        amount: amount,
        category: category,
      };

      if (editId) {
        const data = await updateExpense(editId, expenseData);

        setExpenses(
          expenses.map((expense) =>
            expense._id === editId ? data.expense : expense
          )
        );

        setEditId(null);
      } else {
        const data = await addExpense(expenseData);

        setExpenses([data.expense, ...expenses]);
      }

      setExpenseName("");
      setAmount("");
      setCategory("Food");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to save expense");
    }
  }

  async function handleDeleteExpense(id) {
    try {
      await deleteExpense(id);

      setExpenses(
        expenses.filter((expense) => expense._id !== id)
      );
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to delete expense");
    }
  }

  function handleEditExpense(expense) {
    setExpenseName(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);

    setEditId(expense._id);
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
        Welcome Raj
      </h2>

      <button
        className="theme-btn"
        onClick={() => setDarkMode(!darkMode)}
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
      </div>

      <button>Add Expense</button>

      <hr />

      <ExpenseForm
        expenseName={expenseName}
        setExpenseName={setExpenseName}
        amount={amount}
        setAmount={setAmount}
        category={category}
        setCategory={setCategory}
        handleSaveExpense={handleSaveExpense}
      />

      <hr />

      <h2>Recent Expenses</h2>

      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
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

      <br />
      <br />

      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      >
        <option value="latest">Latest</option>
        <option value="highest">Highest Amount</option>
        <option value="lowest">Lowest Amount</option>
      </select>

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
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">Loading expenses...</td>
            </tr>
          ) : filteredExpenses.length === 0 ? (
            <tr>
              <td colSpan="6">No expenses found.</td>
            </tr>
          ) : (
            filteredExpenses.map((expense) => (
              <tr key={expense._id}>
                <td>
                  {new Date(
                    expense.updatedAt || expense.createdAt
                  ).toLocaleDateString()}
                </td>

                <td>
                  {new Date(
                    expense.updatedAt || expense.createdAt
                  ).toLocaleTimeString()}
                </td>

                <td>{expense.title}</td>
                <td>₹ {expense.amount}</td>
                <td>{expense.category}</td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditExpense(expense)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDeleteExpense(expense._id)
                    }
                  >
                    Delete
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