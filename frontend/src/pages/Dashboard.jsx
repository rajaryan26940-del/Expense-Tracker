import { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import ExpenseForm from "../components/ExpenseForm";

function Dashboard() {
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
 const [expenses, setExpenses] = useState(() => {
  const savedExpenses = localStorage.getItem("expenses");

  return savedExpenses ? JSON.parse(savedExpenses) : [];
});
useEffect(() => {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}, [expenses]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editIndex, setEditIndex] = useState(null);
const [sortOption, setSortOption] = useState("latest");
const [selectedMonth, setSelectedMonth] = useState("All");
const [darkMode, setDarkMode] = useState(false);
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
    const matchesSearch = expense.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
  filterCategory === "All" ||
  expense.category === filterCategory;

const matchesMonth =
  selectedMonth === "All" ||
  new Date(expense.createdAt).toLocaleString("default", {
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

  function handleSaveExpense() {
    if (expenseName === "") {
      alert("Please enter Expense Name");
      return;
    }

    if (amount === "") {
      alert("Please enter Amount");
      return;
    }

   const newExpense = {
  name: expenseName,
  amount: amount,
  category: category,
  date: new Date().toLocaleDateString(),
  time: new Date().toLocaleTimeString(),
};

    if (editIndex === null) {
      setExpenses([...expenses, newExpense]);
    } else {
      const updatedExpenses = [...expenses];
      updatedExpenses[editIndex] = newExpense;
      setExpenses(updatedExpenses);
      setEditIndex(null);
    }

    setExpenseName("");
    setAmount("");
    setCategory("Food");
  }

  function handleDeleteExpense(indexToDelete) {
    const updatedExpenses = expenses.filter(
      (expense, index) => index !== indexToDelete
    );

    setExpenses(updatedExpenses);
  }

  function handleEditExpense(index) {
    const expense = expenses[index];

    setExpenseName(expense.name);
    setAmount(expense.amount);
    setCategory(expense.category);

    setEditIndex(index);
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

<table className="dashboard-table"></table>

      

      <br />
      <br />


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
          {filteredExpenses.length === 0 && (
            <tr>
              <td colSpan="4">No expenses found.</td>
            </tr>
          )}

          {filteredExpenses.map((expense, index) => (
            <tr key={index}>
  <td>{expense.date}</td>
  <td>{expense.time}</td>
  <td>{expense.name}</td>
  <td>₹ {expense.amount}</td>
  <td>{expense.category}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => handleEditExpense(index)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDeleteExpense(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="total-expense">
        Total Expense: ₹ {totalExpense}
      </h2>
    </div>
  );
}

export default Dashboard;