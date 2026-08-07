import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import ConfirmModal from "../components/ConfirmModal";
import ExpenseForm from "../components/ExpenseForm";
import IncomeForm from "../components/IncomeForm";
import IncomeTable from "../components/IncomeTable";
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
import {
  addIncome,
  getIncome,
  updateIncome,
  deleteIncome,
} from "../services/incomeService";
import {
  LayoutDashboard,
  Receipt,
  IndianRupee,
  PiggyBank,
  BarChart3,
  FolderTree,
  Settings,
  Moon,
  Bell,
  LogOut,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Tag,
  ListChecks,
  FileText,
  Pencil,
} from "lucide-react";
function Dashboard() {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [incomeTitle, setIncomeTitle] = useState("");
const [incomeAmount, setIncomeAmount] = useState("");
const [incomeSource, setIncomeSource] = useState("");

const [incomeList, setIncomeList] = useState([]);

const [incomeEditId, setIncomeEditId] = useState(null);
  const [receipt, setReceipt] = useState(null);
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
  const [activeForm, setActiveForm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(() => {
    const saved = localStorage.getItem("unreadCount");
    return saved !== null ? Number(saved) : 1;
  });
  const notifRef = useRef(null);
  const [activePage, setActivePage] = useState("Dashboard");

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    confirmButtonClass: "confirm-btn",
    onConfirmAction: null,
  });

  function openConfirm({ title, message, confirmText, confirmButtonClass, onConfirmAction }) {
    setConfirmState({
      isOpen: true,
      title,
      message,
      confirmText: confirmText || "Confirm",
      confirmButtonClass: confirmButtonClass || "confirm-btn",
      onConfirmAction,
    });
  }

  function closeConfirm() {
    setConfirmState((s) => ({ ...s, isOpen: false }));
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleThemeToggle() {
  const newDarkMode = !darkMode;

  setDarkMode(newDarkMode);
  localStorage.setItem("darkMode", newDarkMode);
}
  function handleLogout() {
  openConfirm({
    title: "Logout",
    message: "Are you sure you want to logout?",
    confirmText: "Logout",
    onConfirmAction: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("name");

      toast.success("Logout Successful!");

      navigate("/");
    },
  });
}
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data.expenses);
        await loadIncome();
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
  const totalIncome = incomeList.reduce(
  (total, income) => total + Number(income.amount),
  0
);
const remainingBalance =
  totalIncome - totalExpense;
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
   const budgetUsedPercentage =
  monthlyBudget > 0
    ? Math.min((totalExpense / monthlyBudget) * 100, 100)
    : 0;

const budgetStatusColor =
  budgetUsedPercentage < 70
    ? "#16a34a"
    : budgetUsedPercentage < 100
    ? "#f59e0b"
    : "#ef4444";


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
  const closeAndReset = () => {
    if (showForm) {
      setExpenseName("");
      setAmount("");
      setCategory("Food");
      setEditId(null);
    }
    setShowForm(!showForm);
  };

  if (showForm && editId) {
    openConfirm({
      title: "Close Editing",
      message: "Are you sure you want to close editing?",
      confirmText: "Close",
      onConfirmAction: closeAndReset,
    });
    return;
  }

  if (
    showForm &&
    !editId &&
    (expenseName.trim() !== "" || amount.trim() !== "")
  ) {
    openConfirm({
      title: "Discard Expense",
      message: "Are you sure you want to discard this expense?",
      confirmText: "Discard",
      onConfirmAction: closeAndReset,
    });
    return;
  }

  closeAndReset();
}

  async function handleSaveExpense() {
  if (expenseName.trim() === "") {
  toast.warning("Please enter Expense Name");
  return;
}
    if (String(amount).trim() === "") {
      toast.warning("Please enter Amount");
      return;
    }
if (Number(amount) <= 0) {
  toast.warning("Amount must be greater than 0");
  return;
}
    try {
      setSaving(true);
      const expenseData = new FormData();

expenseData.append("title", expenseName);
expenseData.append("amount", amount);
expenseData.append("category", category);
expenseData.append("isRecurring", isRecurring);
expenseData.append("recurringType", recurringType);

if (receipt) {
  expenseData.append("receipt", receipt);
}

      if (editId) {
        const data = await updateExpense(editId, expenseData);

        setExpenses(
          expenses.map((expense) =>
            expense._id === editId ? data.expense : expense
          )
        );

        setEditId(null);
        toast.success("Expense updated successfully!");
      } else {
        const data = await addExpense(expenseData);

        setExpenses([data.expense, ...expenses]);
        toast.success("Expense added successfully!");
      }

     setExpenseName("");
setAmount("");
setCategory("Food");
setIsRecurring(false);
setRecurringType("Monthly");
setShowForm(false);
    } catch (error) {
  console.log(error);
  toast.error(
    error.response?.data?.message ||
      "Failed to save expense"
  );
} finally {
  setSaving(false);
}
  }

  async function handleDeleteExpense(id) {
  openConfirm({
    title: "Delete Expense",
    message: "Are you sure you want to delete this expense?",
    confirmText: "Delete",
    confirmButtonClass: "confirm-btn",
    onConfirmAction: async () => {
      try {
        setDeletingId(id);
        await deleteExpense(id);

        setExpenses(
          expenses.filter((expense) => expense._id !== id)
        );
        toast.success("Expense deleted successfully!");
      } catch (error) {
        console.log(error);
        toast.error(
          error.response?.data?.message ||
            "Failed to delete expense"
        );
      } finally {
        setDeletingId(null);
      }
    },
  });
}
async function handleDeleteIncome(id) {
  openConfirm({
    title: "Delete Income",
    message: "Are you sure you want to delete this income?",
    confirmText: "Delete",
    confirmButtonClass: "confirm-btn",
    onConfirmAction: async () => {
      try {
        await deleteIncome(id);

        setIncomeList(
          incomeList.filter((income) => income._id !== id)
        );

        toast.success("Income deleted successfully!");
      } catch (error) {
        console.log(error);
        toast.error(
          error.response?.data?.message ||
            "Failed to delete income"
        );
      }
    },
  });
}
async function loadIncome() {
  try {
    const data = await getIncome();
    setIncomeList(data.income);
  } catch (error) {
    console.log(error);
  }
}
async function handleSaveIncome() {
  try {
    if (incomeEditId) {
      await updateIncome(incomeEditId, {
        title: incomeTitle,
        amount: incomeAmount,
        source: incomeSource,
      });

      toast.success("Income updated successfully");
    } else {
      await addIncome({
        title: incomeTitle,
        amount: incomeAmount,
        source: incomeSource,
      });
toast.success("Income added successfully");
    }

   await loadIncome();
    setIncomeTitle("");
    setIncomeAmount("");
    setIncomeSource("");

    setIncomeEditId(null);
  } catch (error) {
    console.log(error);

    toast.error(
  error.response?.data?.message ||
    "Something went wrong"
);
  }
}
  function handleEditExpense(expense) {
  const loadExpenseIntoForm = () => {
    setExpenseName(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);

    setIsRecurring(expense.isRecurring);
    setRecurringType(expense.recurringType || "Monthly");

    setReceipt(null);

    setEditId(expense._id);
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  if (editId && editId !== expense._id) {
    openConfirm({
      title: "Unsaved Changes",
      message:
        "You have unsaved changes. Are you sure you want to edit another expense?",
      confirmText: "Yes, Switch",
      onConfirmAction: loadExpenseIntoForm,
    });
    return;
  }

  loadExpenseIntoForm();
}
function handleEditIncome(income) {
  const loadIncomeIntoForm = () => {
    setIncomeTitle(income.title);
    setIncomeAmount(income.amount);
    setIncomeSource(income.source);

    setIncomeEditId(income._id);

    setActiveForm("income");
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  if (incomeEditId && incomeEditId !== income._id) {
    openConfirm({
      title: "Unsaved Changes",
      message:
        "You have unsaved changes. Are you sure you want to edit another income?",
      confirmText: "Yes, Switch",
      onConfirmAction: loadIncomeIntoForm,
    });
    return;
  }

  loadIncomeIntoForm();
}

 function handleCancelEdit() {
  openConfirm({
    title: "Cancel Editing",
    message: "Are you sure you want to cancel editing?",
    confirmText: "Yes, Cancel",
    onConfirmAction: () => {
      setExpenseName("");
      setAmount("");
      setCategory("Food");
      setIsRecurring(false);
      setRecurringType("Monthly");
      setEditId(null);
      setShowForm(false);
    },
  });
}
function handleExportExcel() {
  if (filteredExpenses.length === 0) {
    toast.warning("No expenses available to export.");
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
    toast.warning("No expenses available to export.");
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
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
  <div className="sidebar-logo-row">
    <div className="sidebar-logo-icon">
      <LayoutDashboard size={18} />
    </div>
    <span className="sidebar-logo">Expense Tracker</span>
  </div>

  <nav className="sidebar-menu">
  <button
    className={`sidebar-item ${activePage === "Dashboard" ? "active" : ""}`}
    onClick={() => setActivePage("Dashboard")}
  >
    <LayoutDashboard size={20} />
    <span>Dashboard</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Expenses" ? "active" : ""}`}
    onClick={() => setActivePage("Expenses")}
  >
    <Receipt size={20} />
    <span>Expenses</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Income" ? "active" : ""}`}
    onClick={() => setActivePage("Income")}
  >
    <IndianRupee size={20} />
    <span>Income</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Budget" ? "active" : ""}`}
    onClick={() => setActivePage("Budget")}
  >
    <PiggyBank size={20} />
    <span>Budget</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Analytics" ? "active" : ""}`}
    onClick={() => setActivePage("Analytics")}
  >
    <BarChart3 size={20} />
    <span>Analytics</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Reports" ? "active" : ""}`}
    onClick={() => setActivePage("Reports")}
  >
    <FileText size={20} />
    <span>Reports</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Categories" ? "active" : ""}`}
    onClick={() => setActivePage("Categories")}
  >
    <FolderTree size={20} />
    <span>Categories</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Settings" ? "active" : ""}`}
    onClick={() => setActivePage("Settings")}
  >
    <Settings size={20} />
    <span>Settings</span>
  </button>
</nav>

<div className="sidebar-bottom">
  <div className="profile-card">
    <div className="profile-avatar">
      {(localStorage.getItem("name") || "U").charAt(0).toUpperCase()}
    </div>
    <div className="profile-info">
      <p className="profile-name">{localStorage.getItem("name")}</p>
      <span className="profile-link">View Profile</span>
    </div>
  </div>

  <div className="dark-mode-row">
    <span>Dark Mode</span>
    <label className="switch">
      <input
        type="checkbox"
        checked={darkMode}
        onChange={handleThemeToggle}
      />
      <span className="slider" />
    </label>
  </div>
</div>
</aside>

      <main className="dashboard-main">
      <div className="top-header">
        <div>
          <h1 className="page-title">Expense Tracker Dashboard</h1>
          <p className="page-subtitle">Track your income, expenses and budget in one place.</p>
        </div>

        <div className="header-actions">
          <button className="header-icon-btn" onClick={handleThemeToggle} aria-label="Toggle dark mode">
            <Moon size={18} />
          </button>

          <div className="notif-wrapper" ref={notifRef}>
            <button className="header-icon-btn" onClick={() => setShowNotifications((p) => !p)} aria-label="Notifications">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span>Notifications</span>
                  <button
                    className="notif-mark-read"
                    onClick={() => {
                      setUnreadCount(0);
                      localStorage.setItem("unreadCount", 0);
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="notif-item">
                  <p className="notif-title">Budget Alert</p>
                  <p className="notif-text">You've used {budgetUsedPercentage.toFixed(0)}% of your monthly budget.</p>
                </div>
                <a className="notif-view-all" href="#">View all notifications</a>
              </div>
            )}
          </div>

          <button className="header-icon-btn logout-icon-btn" onClick={handleLogout} aria-label="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="welcome-row">
        <p className="welcome-text">
          Welcome back, <span className="welcome-name">{localStorage.getItem("name")}</span> 👋
        </p>
        <div className="action-buttons">
          <button className="btn-primary" onClick={() => { setActiveForm("expense"); handleToggleForm(); }}>
            + {showForm && activeForm === "expense" ? "Close Form" : "Add Expense"}
          </button>
          <button className="btn-success" onClick={() => {
            setIncomeTitle(""); setIncomeAmount(""); setIncomeSource("");
            setIncomeEditId(null); setActiveForm("income"); setShowForm(true);
          }}>
            + Add Income
          </button>
        </div>
      </div>

    {activePage !== "Dashboard" ? (
      <div className="coming-soon">
        <h2>{activePage}</h2>
        <p>This section is coming soon.</p>
      </div>
    ) : (
    <>
    <div className="summary-cards">
  <div className="card">
    <div className="card-icon icon-red"><Receipt size={18} /></div>
    <h3>Total Expense</h3>
    <p>₹ {totalExpense.toLocaleString("en-IN")}</p>
  </div>
    <div className="card">
    <div className="card-icon icon-green"><IndianRupee size={18} /></div>
  <h3>Total Income</h3>

  <p
    style={{
      color: "#16a34a",
    }}
  >
    ₹ {totalIncome.toLocaleString("en-IN")}
  </p>
</div>
<div className="card">
    <div className="card-icon icon-red"><PiggyBank size={18} /></div>
  <h3>Remaining Balance</h3>

  <p
    style={{
      color:
        remainingBalance >= 0
          ? "#16a34a"
          : "#dc2626",
    }}
  >
    ₹ {remainingBalance.toLocaleString("en-IN")}
  </p>
</div>
  <div className="card">
    <div className="card-icon icon-purple"><ListChecks size={18} /></div>
    <h3>Total Entries</h3>
    <p>{totalEntries}</p>
  </div>

  <div className="card">
    <div className="card-icon icon-amber"><TrendingUp size={18} /></div>
  <h3>Highest Expense</h3>

  <p>
    ₹ {highestExpense.toLocaleString("en-IN")}
  </p>
</div>
  <div className="card">
    <div className="card-icon icon-green"><ArrowDown size={18} /></div>
  <h3>Lowest Expense</h3>
  <p>₹ {lowestExpense.toLocaleString("en-IN")}</p>
</div>
<div className="card">
  <div className="card-icon icon-red"><Tag size={18} /></div>
  <h3>Most Expensive Category</h3>

  <div
  style={{
    fontSize: "18px",
    fontWeight: "500",
    marginBottom: "8px",
  }}
>
  {topCategory}
</div>

<p>₹ {topCategoryAmount.toLocaleString("en-IN")}</p>
</div>
<div className="card">
  <div className="card-icon icon-purple"><BarChart3 size={18} /></div>
  <h3>This Month's Spending</h3>

  <p
    style={{
      marginTop:  "28px",
    }}
  >
    ₹ {thisMonthExpense.toLocaleString("en-IN")}
  </p>
</div>
<div className="card">
  <div className="card-icon icon-amber"><TrendingUp size={18} /></div>
  <h3>Highest Spending Day</h3>

 <div
  style={{
    fontSize: "18px",
    fontWeight: "500",
    marginBottom: "8px",
  }}
>
  {highestSpendingDay}
</div>

<p>₹ {highestDayAmount.toLocaleString("en-IN")}</p>
</div>
<div className="card">
  <div className={`card-icon ${expenseTrend === "Increase" ? "icon-red" : "icon-green"}`}>
    {expenseTrend === "Increase" ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
  </div>
  <h3>Last Month vs This Month</h3>

  <p>₹ {thisMonthExpense.toLocaleString("en-IN")}</p>

<small>
  Last Month: ₹ {lastMonthExpense.toLocaleString("en-IN")}
</small>
  <small
    style={{
      color:
        expenseTrend === "Increase"
          ? "#dc2626"
          : "#16a34a",
      fontWeight: "600",
    }}
  >
    {expenseTrend === "Increase"
      ? "📈 Increased"
      : "📉 Decreased"}{" "}
    ₹ {Math.abs(expenseDifference).toLocaleString("en-IN")}
  </small>
</div>
<div className="card">
  <div className="card-icon icon-purple"><BarChart3 size={18} /></div>
  <h3>Average Daily Spending</h3>
<p>₹ {averageDailySpending.toLocaleString("en-IN")}</p>

  <small
  style={{
    display: "block",
    marginTop: "6px",
    fontSize: "16px",
    fontWeight: "500",
    color: "#555",
  }}
>
  Per Day
</small>
</div>
<div className="card">
  <div className="card-icon icon-green"><PiggyBank size={18} /></div>
  <h3>Monthly Budget</h3>

<p>₹ {monthlyBudget.toLocaleString("en-IN")}</p>

  <small
  style={{
    display: "block",
    marginTop: "6px",
    fontSize: "16px",
    fontWeight: "500",
    color: "#666",
  }}
>
  Current Budget
</small>
</div>
</div>
<div className="dashboard-bottom-row">
<div className="budget-section">
  <div className="budget-card-header">
    <h2>Monthly Budget Overview</h2>
    {!editingBudget && (
      <button
        className="budget-edit-link-btn"
        onClick={() => setEditingBudget(true)}
      >
        <Pencil size={14} /> Edit Budget
      </button>
    )}
  </div>

  {editingBudget && (
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
            toast.warning("Please enter a valid budget greater than 0.");
            return;
          }

          setMonthlyBudget(budget);
          setBudgetInput(budget);
          localStorage.setItem("monthlyBudget", budget);
          setEditingBudget(false);

          toast.success("Monthly budget updated successfully!");
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
  )}

  <div className="budget-details">
    <div className="budget-details-rows">
    <p className="budget-row">
      <span className="budget-row-icon icon-purple">
        <PiggyBank size={16} />
      </span>
      <span className="budget-row-text">
        <span className="budget-row-label">Budget</span>
        <span className="budget-row-value">₹ {monthlyBudget}</span>
      </span>
    </p>

    <p className="budget-row">
      <span className="budget-row-icon icon-red">
        <Receipt size={16} />
      </span>
      <span className="budget-row-text">
        <span className="budget-row-label">Spent</span>
        <span className="budget-row-value">₹ {totalExpense}</span>
      </span>
    </p>

    <p className="budget-row">
      <span className="budget-row-icon icon-green">
        <TrendingUp size={16} />
      </span>
      <span className="budget-row-text">
        <span className="budget-row-label">Remaining</span>
        <span className="budget-row-value">₹ {remainingBudget}</span>
      </span>
    </p>

    <p className="budget-row">
      <span className="budget-row-icon icon-amber">
        <BarChart3 size={16} />
      </span>
      <span className="budget-row-text">
        <span className="budget-row-label">Used</span>
        <span
          className="budget-row-value"
          style={{ fontWeight: "700", color: budgetStatusColor }}
        >
          {budgetUsedPercentage.toFixed(1)}%
        </span>
      </span>
    </p>
    </div>

<div className="budget-gauge-col">
<div className="budget-gauge">
  <svg width="170" height="170" viewBox="0 0 170 170">
    <circle
      cx="85"
      cy="85"
      r="72"
      fill="none"
      stroke="#e5e7eb"
      strokeWidth="14"
    />
    <circle
      cx="85"
      cy="85"
      r="72"
      fill="none"
      stroke={budgetStatusColor}
      strokeWidth="14"
      strokeDasharray={2 * Math.PI * 72}
      strokeDashoffset={
        2 * Math.PI * 72 * (1 - budgetUsedPercentage / 100)
      }
      strokeLinecap="round"
      transform="rotate(-90 85 85)"
    />
  </svg>
  <div className="budget-gauge-label">
    <span className="budget-gauge-percent">
      {budgetUsedPercentage.toFixed(1)}%
    </span>
    <span className="budget-gauge-sub">Used</span>
  </div>
</div>

{remainingBudget >= 0 ? (
  <p className="budget-remaining-msg" style={{ color: "#16a34a" }}>
    ✅ You have ₹ {remainingBudget} remaining this month.
  </p>
) : (
  <p className="budget-remaining-msg" style={{ color: "#dc2626" }}>
    ⚠️ Budget exceeded by ₹ {Math.abs(remainingBudget)}.
  </p>
)}
</div>
  </div>

  <div className="budget-progress">
  <div
    className="budget-progress-fill"
    style={{
      width: `${budgetUsedPercentage}%`,
      backgroundColor: budgetStatusColor,
    }}
  ></div>
</div>

</div>

<div className="expense-chart-wrapper">
  <ExpenseChart
    expenses={expenses}
    averageExpense={averageExpense}
  />
</div>
</div>

      <hr />
  {showForm && activeForm === "expense" && (
  <div ref={formRef}>
    <ExpenseForm
  expenseName={expenseName}
  setExpenseName={setExpenseName}
  amount={amount}
  setAmount={setAmount}
  category={category}
  setCategory={setCategory}
  receipt={receipt}
  setReceipt={setReceipt}
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

{showForm && activeForm === "income" && (
  <div ref={formRef}>
    <IncomeForm
      incomeTitle={incomeTitle}
      setIncomeTitle={setIncomeTitle}
      incomeAmount={incomeAmount}
      setIncomeAmount={setIncomeAmount}
      incomeSource={incomeSource}
      setIncomeSource={setIncomeSource}
      handleSaveIncome={handleSaveIncome}
      incomeEditId={incomeEditId}
    />
  </div>
)}
      <hr />

      <div className="recent-row">
        <div className="recent-col">
          <IncomeTable
            incomeList={incomeList.slice(0, 5)}
            handleEditIncome={handleEditIncome}
            handleDeleteIncome={handleDeleteIncome}
          />
        </div>

        <div className="recent-col">
          <h2>Recent Expenses</h2>
          <table className="dashboard-table recent-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="5">No expenses found.</td>
                </tr>
              ) : (
                expenses.slice(0, 5).map((expense) => (
                  <tr key={expense._id}>
                    <td>
                      {new Date(
                        expense.updatedAt || expense.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td>{expense.title}</td>
                    <td>₹ {expense.amount}</td>
                    <td>
                      <span
                        className={`category-pill cat-${expense.category?.toLowerCase()}`}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditExpense(expense)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteExpense(expense._id)}
                        disabled={deletingId === expense._id}
                      >
                        {deletingId === expense._id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2>Full Expense List</h2>
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
<th>Receipt</th>
<th>Recurring</th>
<th>Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8">
                Loading expenses...
              </td>
            </tr>
          ) : filteredExpenses.length === 0 ? (
            <tr>
              <td colSpan="8">
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
                <td>
                  <span className={`category-pill cat-${expense.category?.toLowerCase()}`}>
                    {expense.category}
                  </span>
                </td>

<td>
  {expense.receipt ? (
    <a
      href={expense.receipt}
      target="_blank"
      rel="noopener noreferrer"
      className="view-receipt-btn"
    >
      📄 View
    </a>
  ) : (
    "-"
  )}
</td>

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
    </>
    )}
           </main>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        confirmButtonClass={confirmState.confirmButtonClass}
        onConfirm={() => {
          confirmState.onConfirmAction?.();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />
    </div>
  );
}

export default Dashboard;