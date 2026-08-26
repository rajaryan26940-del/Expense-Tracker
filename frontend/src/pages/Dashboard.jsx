import { toast } from "react-toastify";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { updateName, changePassword, updateProfilePicture } from "../services/userService";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";
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
  Eye,
  EyeOff,
  Menu,
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

const [incomeSearch, setIncomeSearch] = useState("");
const [incomeSortOption, setIncomeSortOption] = useState("latest");

const [settingsName, setSettingsName] = useState(
  localStorage.getItem("name") || ""
);
const [savingName, setSavingName] = useState(false);

const [profilePicture, setProfilePicture] = useState(
  localStorage.getItem("profilePicture") || ""
);
const [avatarFile, setAvatarFile] = useState(null);
const [avatarPreview, setAvatarPreview] = useState(null);
const [savingAvatar, setSavingAvatar] = useState(false);
const [showCropModal, setShowCropModal] = useState(false);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmNewPassword, setConfirmNewPassword] = useState("");
const [savingPassword, setSavingPassword] = useState(false);

const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

const [categoryBudgets, setCategoryBudgets] = useState(() => {
  const saved = localStorage.getItem("categoryBudgets");
  return saved
    ? JSON.parse(saved)
    : { Food: 0, Travel: 0, Shopping: 0, Bills: 0, Others: 0 };
});
const [editingCategoryBudgets, setEditingCategoryBudgets] = useState(false);
const [categoryBudgetInputs, setCategoryBudgetInputs] = useState(categoryBudgets);

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
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved !== null ? JSON.parse(saved) : [];
  });

  function formatRelativeTime(timestamp) {
    const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);

    if (secondsAgo < 60) {
      return "Just now";
    }

    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
      return `${minutesAgo}m ago`;
    }

    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) {
      return `${hoursAgo}h ago`;
    }

    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo}d ago`;
  }

  function addNotification(title, message) {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      timestamp: Date.now(),
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, 20);
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });

    setUnreadCount((prev) => {
      const updated = prev + 1;
      localStorage.setItem("unreadCount", String(updated));
      return updated;
    });
  }
  const fullExpenseListRef = useRef(null);
  const previousBudgetPercentRef = useRef(null);
  const [activePage, setActivePage] = useState("Dashboard");
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleNavClick(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

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

const filteredIncomeList = incomeList
  .filter((income) =>
    income.title.toLowerCase().includes(incomeSearch.toLowerCase())
  )
  .sort((a, b) => {
    if (incomeSortOption === "highest") {
      return Number(b.amount) - Number(a.amount);
    }

    if (incomeSortOption === "lowest") {
      return Number(a.amount) - Number(b.amount);
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

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

useEffect(() => {
  if (previousBudgetPercentRef.current === null) {
    previousBudgetPercentRef.current = budgetUsedPercentage;
    return;
  }

  const previous = previousBudgetPercentRef.current;
  const current = budgetUsedPercentage;

  if (previous < 100 && current >= 100) {
    addNotification(
      "Budget Exceeded",
      `You've exceeded your monthly budget (${current.toFixed(1)}% used).`
    );
  } else if (previous < 70 && current >= 70) {
    addNotification(
      "Budget Alert",
      `You've used ${current.toFixed(1)}% of your monthly budget.`
    );
  }

  previousBudgetPercentRef.current = current;
}, [budgetUsedPercentage]);


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

const categoryColors = {
  Food: "#3F5FE0",
  Travel: "#28A745",
  Shopping: "#FFC107",
  Bills: "#DC3545",
  Others: "#6F42C1",
};

function getCategoryStatusColor(percentage) {
  return percentage < 70
    ? "#16a34a"
    : percentage < 100
    ? "#f59e0b"
    : "#ef4444";
}

const allExpensesTotal = expenses.reduce(
  (sum, expense) => sum + Number(expense.amount),
  0
);

const categoryStats = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Others",
].map((name) => {
  const catExpenses = expenses.filter(
    (expense) => expense.category === name
  );

  const total = catExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return {
    name,
    total,
    count: catExpenses.length,
    percentage:
      allExpensesTotal > 0 ? (total / allExpensesTotal) * 100 : 0,
  };
});

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

// ---------- Analytics computations ----------

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dayOfWeekTotals = weekdayNames.map((day) => ({ day, total: 0 }));

expenses.forEach((expense) => {
  const expenseDate = new Date(expense.updatedAt || expense.createdAt);
  dayOfWeekTotals[expenseDate.getDay()].total += Number(expense.amount);
});

const highestDayOfWeekTotal = Math.max(
  ...dayOfWeekTotals.map((d) => d.total),
  0
);

const monthlyTrend = [];

for (let i = 5; i >= 0; i--) {
  const targetDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - i,
    1
  );
  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();

  const monthExpenseTotal = expenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.updatedAt || expense.createdAt);
    if (
      expenseDate.getMonth() === targetMonth &&
      expenseDate.getFullYear() === targetYear
    ) {
      return total + Number(expense.amount);
    }
    return total;
  }, 0);

  const monthIncomeTotal = incomeList.reduce((total, income) => {
    const incomeDate = new Date(income.createdAt);
    if (
      incomeDate.getMonth() === targetMonth &&
      incomeDate.getFullYear() === targetYear
    ) {
      return total + Number(income.amount);
    }
    return total;
  }, 0);

  monthlyTrend.push({
    label: targetDate.toLocaleString("default", { month: "short" }),
    expense: monthExpenseTotal,
    income: monthIncomeTotal,
  });
}

const highestMonthlyTrendValue = Math.max(
  ...monthlyTrend.map((m) => Math.max(m.expense, m.income)),
  0
);

const topExpenses = [...expenses]
  .sort((a, b) => Number(b.amount) - Number(a.amount))
  .slice(0, 5);

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
function handleToggleIncomeForm() {
  const closeAndReset = () => {
    if (showForm && activeForm === "income") {
      setIncomeTitle("");
      setIncomeAmount("");
      setIncomeSource("");
      setIncomeEditId(null);
      setShowForm(false);
    } else {
      setIncomeTitle("");
      setIncomeAmount("");
      setIncomeSource("");
      setIncomeEditId(null);
      setActiveForm("income");
      setShowForm(true);
    }
  };

  if (showForm && activeForm === "income" && incomeEditId) {
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
    activeForm === "income" &&
    !incomeEditId &&
    (incomeTitle.trim() !== "" || String(incomeAmount).trim() !== "")
  ) {
    openConfirm({
      title: "Discard Income",
      message: "Are you sure you want to discard this income entry?",
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
  const expenseToDelete = expenses.find((expense) => expense._id === id);

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

        addNotification(
          "Expense Deleted",
          `Expense "${expenseToDelete?.title || "Untitled"}" of ₹${expenseToDelete?.amount ?? 0} deleted.`
        );
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

addNotification(
  "Income Added",
  `${incomeTitle || "Income"} of ₹${incomeAmount || 0} added.`
);
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
function handleAvatarFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  setAvatarFile(file);
  setAvatarPreview(URL.createObjectURL(file));
  setCrop({ x: 0, y: 0 });
  setZoom(1);
  setCroppedAreaPixels(null);
  setShowCropModal(true);
}

const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsValue) => {
  setCroppedAreaPixels(croppedAreaPixelsValue);
}, []);

function handleCancelCrop() {
  setShowCropModal(false);
  setAvatarFile(null);
  setAvatarPreview(null);
  setCrop({ x: 0, y: 0 });
  setZoom(1);
  setCroppedAreaPixels(null);
}

async function handleSaveCroppedAvatar() {
  if (!avatarPreview || !croppedAreaPixels) {
    toast.warning("Please adjust the crop area first");
    return;
  }

  try {
    setSavingAvatar(true);
    const croppedBlob = await getCroppedImg(avatarPreview, croppedAreaPixels);
    const croppedFile = new File([croppedBlob], "profile.jpg", {
      type: "image/jpeg",
    });

    const data = await updateProfilePicture(croppedFile);

    localStorage.setItem("profilePicture", data.profilePicture);
    setProfilePicture(data.profilePicture);
    setShowCropModal(false);
    setAvatarFile(null);
    setAvatarPreview(null);

    toast.success("Profile picture updated successfully!");
  } catch (error) {
    console.log(error);
    toast.error(
      error.response?.data?.message || "Failed to update profile picture"
    );
  } finally {
    setSavingAvatar(false);
  }
}

async function handleUpdateName() {
  if (settingsName.trim() === "") {
    toast.warning("Please enter a name");
    return;
  }

  try {
    setSavingName(true);
    const data = await updateName(settingsName.trim());

    localStorage.setItem("name", data.name);
    setSettingsName(data.name);

    toast.success("Name updated successfully!");
  } catch (error) {
    console.log(error);
    toast.error(
      error.response?.data?.message || "Failed to update name"
    );
  } finally {
    setSavingName(false);
  }
}

async function handleChangePassword() {
  if (currentPassword.trim() === "") {
    toast.warning("Please enter your current password");
    return;
  }

  if (newPassword.trim() === "") {
    toast.warning("Please enter a new password");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    toast.warning("New passwords do not match");
    return;
  }

  try {
    setSavingPassword(true);
    await changePassword(currentPassword, newPassword);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");

    toast.success("Password changed successfully!");
  } catch (error) {
    console.log(error);
    toast.error(
      error.response?.data?.message || "Failed to change password"
    );
  } finally {
    setSavingPassword(false);
  }
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
      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
  <div className="sidebar-logo-row">
    <div className="sidebar-logo-icon">
      <LayoutDashboard size={18} />
    </div>
    <span className="sidebar-logo">Expense Tracker</span>
  </div>

  <nav className="sidebar-menu">
  <button
    className={`sidebar-item ${activePage === "Dashboard" ? "active" : ""}`}
    onClick={() => handleNavClick("Dashboard")}
  >
    <LayoutDashboard size={20} />
    <span>Dashboard</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Expenses" ? "active" : ""}`}
    onClick={() => handleNavClick("Expenses")}
  >
    <Receipt size={20} />
    <span>Expenses</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Income" ? "active" : ""}`}
    onClick={() => handleNavClick("Income")}
  >
    <IndianRupee size={20} />
    <span>Income</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Budget" ? "active" : ""}`}
    onClick={() => handleNavClick("Budget")}
  >
    <PiggyBank size={20} />
    <span>Budget</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Analytics" ? "active" : ""}`}
    onClick={() => handleNavClick("Analytics")}
  >
    <BarChart3 size={20} />
    <span>Analytics</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Reports" ? "active" : ""}`}
    onClick={() => handleNavClick("Reports")}
  >
    <FileText size={20} />
    <span>Reports</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Categories" ? "active" : ""}`}
    onClick={() => handleNavClick("Categories")}
  >
    <FolderTree size={20} />
    <span>Categories</span>
  </button>

  <button
    className={`sidebar-item ${activePage === "Settings" ? "active" : ""}`}
    onClick={() => handleNavClick("Settings")}
  >
    <Settings size={20} />
    <span>Settings</span>
  </button>
</nav>

<div className="sidebar-bottom">
  <div className="profile-card" onClick={() => setActivePage("Settings")}>
    <div className="profile-avatar">
      {profilePicture ? (
        <img src={profilePicture} alt="Profile" className="profile-avatar-img" />
      ) : (
        (localStorage.getItem("name") || "U").charAt(0).toUpperCase()
      )}
    </div>
    <div className="profile-info">
      <p className="profile-name">{localStorage.getItem("name")}</p>
      <span className="profile-link">View Profile</span>
    </div>
  </div>
</div>
</aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <main className="dashboard-main">
      <div className="top-header">
        <div className="top-header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 className="page-title">Expense Tracker Dashboard</h1>
            <p className="page-subtitle">Track your income, expenses and budget in one place.</p>
          </div>
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
                {notifications.length === 0 ? (
                  <p className="notif-empty">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div className="notif-item" key={notification.id}>
                      <p className="notif-title">{notification.title}</p>
                      <p className="notif-text">{notification.message}</p>
                      <p className="notif-time">
                        {formatRelativeTime(notification.timestamp)}
                      </p>
                    </div>
                  ))
                )}
                <button
                  className="notif-view-all"
                  onClick={() => {
                    setShowNotifications(false);
                    setShowAllNotifications(true);
                  }}
                >
                  View all notifications
                </button>
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
          {(activePage === "Dashboard" || activePage === "Expenses") && (
            <button
              className="btn-primary"
              onClick={() => {
                const willOpen = !(showForm && activeForm === "expense");
                setActiveForm("expense");
                handleToggleForm();
                if (willOpen) {
                  setTimeout(() => {
                    formRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                }
              }}
            >
              + {showForm && activeForm === "expense" ? "Close Form" : "Add Expense"}
            </button>
          )}
          {(activePage === "Dashboard" || activePage === "Income") && (
            <button
              className="btn-success"
              onClick={() => {
                const willOpen = !(showForm && activeForm === "income");
                handleToggleIncomeForm();
                if (willOpen) {
                  setTimeout(() => {
                    formRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                }
              }}
            >
              + {showForm && activeForm === "income" ? "Close Form" : "Add Income"}
            </button>
          )}
        </div>
      </div>

    {activePage === "Expenses" ? (
      <div className="expenses-page">
        <div className="income-page-header">
          <div>
            <h2>Expenses</h2>
            <p className="income-subtitle">
              All your expenses, with search, filters, and export.
            </p>
          </div>

          <div className="income-page-total">
            <span>Total Expense</span>
            <p style={{ color: "#dc2626" }}>₹ {totalExpense.toLocaleString("en-IN")}</p>
          </div>
        </div>

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
            onChange={(e) => setFilterCategory(e.target.value)}
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

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
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

        <div className="table-scroll-wrapper">
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
                <td colSpan="8">Loading expenses...</td>
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
                      onClick={() => handleEditExpense(expense)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteExpense(expense._id)}
                      disabled={deletingId === expense._id}
                    >
                      {deletingId === expense._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    ) : activePage === "Reports" ? (
      <div className="reports-page">
        <h2>Reports</h2>
        <p className="reports-subtitle">
          Monthly summary for{" "}
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {currentDate.getFullYear()}
        </p>

        <div className="reports-summary-grid">
          <div className="reports-summary-card">
            <span className="reports-summary-label">Total Income</span>
            <p
              className="reports-summary-value"
              style={{ color: "#16a34a" }}
            >
              ₹ {totalIncome.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="reports-summary-card">
            <span className="reports-summary-label">Total Expense</span>
            <p
              className="reports-summary-value"
              style={{ color: "#dc2626" }}
            >
              ₹ {totalExpense.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="reports-summary-card">
            <span className="reports-summary-label">Net Savings</span>
            <p
              className="reports-summary-value"
              style={{
                color: remainingBalance >= 0 ? "#16a34a" : "#dc2626",
              }}
            >
              ₹ {remainingBalance.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="reports-row">
          <div className="reports-card">
            <h3>This Month vs Last Month</h3>
            <p className="reports-big-number">
              ₹ {thisMonthExpense.toLocaleString("en-IN")}
            </p>
            <p className="reports-sub-text">
              Last month: ₹ {lastMonthExpense.toLocaleString("en-IN")}
            </p>
            <p
              className="reports-trend"
              style={{
                color: expenseTrend === "Increase" ? "#dc2626" : "#16a34a",
              }}
            >
              {expenseTrend === "Increase" ? "📈 Increased" : "📉 Decreased"}{" "}
              ₹ {Math.abs(expenseDifference).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="reports-card">
            <h3>Spending Habits</h3>
            <div className="reports-stat-row">
              <span>Average Daily Spending</span>
              <strong>₹ {averageDailySpending.toLocaleString("en-IN")}</strong>
            </div>
            <div className="reports-stat-row">
              <span>Highest Expense</span>
              <strong>₹ {highestExpense.toLocaleString("en-IN")}</strong>
            </div>
            <div className="reports-stat-row">
              <span>Lowest Expense</span>
              <strong>₹ {lowestExpense.toLocaleString("en-IN")}</strong>
            </div>
            <div className="reports-stat-row">
              <span>Highest Spending Day</span>
              <strong>{highestSpendingDay}</strong>
            </div>
          </div>
        </div>

        <h3 className="reports-section-title">Category Breakdown</h3>

        <div className="categories-grid">
          {categoryStats.map((cat) => (
            <div className="category-card" key={cat.name}>
              <div className="category-card-header">
                <span
                  className={`category-pill cat-${cat.name.toLowerCase()}`}
                >
                  {cat.name}
                </span>
                <span className="category-card-percent">
                  {cat.percentage.toFixed(1)}%
                </span>
              </div>

              <p className="category-card-total">
                ₹ {cat.total.toLocaleString("en-IN")}
              </p>

              <p className="category-card-count">
                {cat.count} {cat.count === 1 ? "expense" : "expenses"}
              </p>

              <div className="category-card-bar">
                <div
                  className="category-card-bar-fill"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: categoryColors[cat.name],
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : activePage === "Income" ? (
      <div className="income-page">
        <div className="income-page-header">
          <div>
            <h2>Income</h2>
            <p className="income-subtitle">
              All your income entries in one place.
            </p>
          </div>

          <div className="income-page-total">
            <span>Total Income</span>
            <p>₹ {totalIncome.toLocaleString("en-IN")}</p>
          </div>
        </div>

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

        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search income..."
            value={incomeSearch}
            onChange={(e) => setIncomeSearch(e.target.value)}
          />
          {incomeSearch && (
            <button onClick={() => setIncomeSearch("")}>
              Clear Search
            </button>
          )}

          <select
            value={incomeSortOption}
            onChange={(e) => setIncomeSortOption(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        <div className="table-scroll-wrapper">
        <IncomeTable
          incomeList={filteredIncomeList}
          handleEditIncome={handleEditIncome}
          handleDeleteIncome={handleDeleteIncome}
        />
        </div>
      </div>
    ) : activePage === "Budget" ? (
      <div className="category-budget-page">
        <div className="income-page-header">
          <div>
            <h2>Budget</h2>
            <p className="income-subtitle">
              Set spending limits for each category and track your progress.
            </p>
          </div>

          {!editingCategoryBudgets && (
            <button
              className="budget-edit-link-btn"
              onClick={() => {
                setCategoryBudgetInputs(categoryBudgets);
                setEditingCategoryBudgets(true);
              }}
            >
              <Pencil size={14} /> Edit Budgets
            </button>
          )}
        </div>

        {editingCategoryBudgets && (
          <div className="category-budget-edit-card">
            {["Food", "Travel", "Shopping", "Bills", "Others"].map((name) => (
              <div className="category-budget-edit-row" key={name}>
                <span className={`category-pill cat-${name.toLowerCase()}`}>
                  {name}
                </span>
                <input
                  type="number"
                  className="budget-input"
                  value={categoryBudgetInputs[name]}
                  onChange={(e) =>
                    setCategoryBudgetInputs({
                      ...categoryBudgetInputs,
                      [name]: e.target.value,
                    })
                  }
                  placeholder="Enter budget"
                />
              </div>
            ))}

            <div className="category-budget-edit-actions">
              <button
                className="change-budget-btn"
                onClick={() => {
                  const cleaned = {};
                  let hasInvalid = false;

                  Object.entries(categoryBudgetInputs).forEach(([name, value]) => {
                    const num = Number(value);
                    if (isNaN(num) || num < 0) {
                      hasInvalid = true;
                    }
                    cleaned[name] = isNaN(num) ? 0 : num;
                  });

                  if (hasInvalid) {
                    toast.warning("Please enter valid budget amounts (0 or more).");
                    return;
                  }

                  setCategoryBudgets(cleaned);
                  localStorage.setItem("categoryBudgets", JSON.stringify(cleaned));
                  setEditingCategoryBudgets(false);
                  toast.success("Category budgets updated successfully!");
                }}
              >
                Save Budgets
              </button>

              <button
                className="change-budget-btn"
                onClick={() => {
                  const hasChanges = Object.keys(categoryBudgets).some(
                    (name) =>
                      Number(categoryBudgetInputs[name]) !== Number(categoryBudgets[name])
                  );

                  if (hasChanges) {
                    openConfirm({
                      title: "Discard Changes",
                      message: "Are you sure you want to discard your changes to category budgets?",
                      confirmText: "Discard",
                      onConfirmAction: () => setEditingCategoryBudgets(false),
                    });
                    return;
                  }

                  setEditingCategoryBudgets(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="category-budget-grid">
          {categoryStats.map((cat) => {
            const budget = categoryBudgets[cat.name] || 0;
            const used =
              budget > 0 ? Math.min((cat.total / budget) * 100, 100) : 0;
            const statusColor = getCategoryStatusColor(used);
            const remaining = budget - cat.total;

            return (
              <div className="category-budget-card" key={cat.name}>
                <div className="category-budget-card-header">
                  <span className={`category-pill cat-${cat.name.toLowerCase()}`}>
                    {cat.name}
                  </span>
                  {budget > 0 && (
                    <span
                      className="category-budget-percent"
                      style={{ color: statusColor }}
                    >
                      {used.toFixed(1)}%
                    </span>
                  )}
                </div>

                {budget > 0 ? (
                  <>
                    <p className="category-budget-amounts">
                      ₹ {cat.total.toLocaleString("en-IN")} of ₹{" "}
                      {budget.toLocaleString("en-IN")}
                    </p>

                    <div className="category-budget-bar">
                      <div
                        className="category-budget-bar-fill"
                        style={{ width: `${used}%`, backgroundColor: statusColor }}
                      ></div>
                    </div>

                    <p
                      className="category-budget-remaining"
                      style={{ color: remaining >= 0 ? "#16a34a" : "#dc2626" }}
                    >
                      {remaining >= 0
                        ? `₹ ${remaining.toLocaleString("en-IN")} remaining`
                        : `₹ ${Math.abs(remaining).toLocaleString("en-IN")} over budget`}
                    </p>
                  </>
                ) : (
                  <p className="category-budget-not-set">
                    No budget set for this category yet.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ) : activePage === "Analytics" ? (
      <div className="analytics-page">
        <h2>Analytics</h2>
        <p className="analytics-subtitle">
          Deeper patterns in your spending and income.
        </p>

        <div className="analytics-row">
          <div className="analytics-card">
            <h3>Spending by Day of Week</h3>
            <div className="analytics-bar-list">
              {dayOfWeekTotals.map((d) => (
                <div className="analytics-bar-row" key={d.day}>
                  <span className="analytics-bar-label">{d.day}</span>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{
                        width:
                          highestDayOfWeekTotal > 0
                            ? `${(d.total / highestDayOfWeekTotal) * 100}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                  <span className="analytics-bar-value">
                    ₹ {d.total.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h3>Top 5 Biggest Expenses</h3>
            {topExpenses.length === 0 ? (
              <p className="analytics-empty">No expenses recorded yet.</p>
            ) : (
              <div className="analytics-top-list">
                {topExpenses.map((expense, index) => (
                  <div className="analytics-top-row" key={expense._id}>
                    <span className="analytics-top-rank">#{index + 1}</span>
                    <span className="analytics-top-title">{expense.title}</span>
                    <span
                      className={`category-pill cat-${expense.category?.toLowerCase()}`}
                    >
                      {expense.category}
                    </span>
                    <span className="analytics-top-amount">
                      ₹ {Number(expense.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="analytics-card analytics-trend-card">
          <h3>Income vs Expense — Last 6 Months</h3>
          <div className="analytics-trend-chart">
            {monthlyTrend.map((m) => (
              <div className="analytics-trend-col" key={m.label}>
                <div className="analytics-trend-bars">
                  <div
                    className="analytics-trend-bar analytics-trend-income"
                    style={{
                      height:
                        highestMonthlyTrendValue > 0
                          ? `${(m.income / highestMonthlyTrendValue) * 100}%`
                          : "0%",
                    }}
                    title={`Income: ₹ ${m.income.toLocaleString("en-IN")}`}
                  ></div>
                  <div
                    className="analytics-trend-bar analytics-trend-expense"
                    style={{
                      height:
                        highestMonthlyTrendValue > 0
                          ? `${(m.expense / highestMonthlyTrendValue) * 100}%`
                          : "0%",
                    }}
                    title={`Expense: ₹ ${m.expense.toLocaleString("en-IN")}`}
                  ></div>
                </div>
                <span className="analytics-trend-label">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="analytics-trend-legend">
            <span className="analytics-legend-item">
              <span className="analytics-legend-dot analytics-legend-income"></span>
              Income
            </span>
            <span className="analytics-legend-item">
              <span className="analytics-legend-dot analytics-legend-expense"></span>
              Expense
            </span>
          </div>
        </div>
      </div>
    ) : activePage === "Categories" ? (

      <div className="categories-page">
        <h2>Categories</h2>
        <p className="categories-subtitle">
          Overview of spending across all categories.
        </p>

        <div className="categories-grid">
          {categoryStats.map((cat) => (
            <div className="category-card" key={cat.name}>
              <div className="category-card-header">
                <span
                  className={`category-pill cat-${cat.name.toLowerCase()}`}
                >
                  {cat.name}
                </span>
                <span className="category-card-percent">
                  {cat.percentage.toFixed(1)}%
                </span>
              </div>

              <p className="category-card-total">
                ₹ {cat.total.toLocaleString("en-IN")}
              </p>

              <p className="category-card-count">
                {cat.count} {cat.count === 1 ? "expense" : "expenses"}
              </p>

              <div className="category-card-bar">
                <div
                  className="category-card-bar-fill"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: categoryColors[cat.name],
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : activePage === "Settings" ? (
      <div className="settings-page">
        <h2>Settings</h2>
        <p className="settings-subtitle">
          Manage your account details and security.
        </p>

        <div className="settings-grid">
          <div className="settings-card">
            <h3>Profile Picture</h3>
            <p className="settings-card-desc">
              Upload a photo to personalize your account.
            </p>

            <div className="avatar-upload-row">
              <div className="avatar-preview">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" />
                ) : (
                  <span>{(localStorage.getItem("name") || "U").charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="avatar-upload-actions">
                <label className="avatar-choose-btn">
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    hidden
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <h3>Edit Name</h3>
            <p className="settings-card-desc">
              Update the name shown across your dashboard.
            </p>

            <label className="settings-label">Name</label>
            <input
              type="text"
              className="settings-input"
              value={settingsName}
              onChange={(e) => setSettingsName(e.target.value)}
              placeholder="Enter your name"
            />

            <button
              className="settings-save-btn"
              onClick={handleUpdateName}
              disabled={savingName}
            >
              {savingName ? "Saving..." : "Save Name"}
            </button>
          </div>

          <div className="settings-card">
            <h3>Change Password</h3>
            <p className="settings-card-desc">
              Choose a strong password you don't use elsewhere.
            </p>

            <label className="settings-label">Current Password</label>
            <div className="settings-password-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                className="settings-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="settings-eye-btn"
                onClick={() => setShowCurrentPassword((p) => !p)}
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <label className="settings-label">New Password</label>
            <div className="settings-password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                className="settings-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters, 1 letter, 1 number, 1 special"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="settings-eye-btn"
                onClick={() => setShowNewPassword((p) => !p)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <label className="settings-label">Confirm New Password</label>
            <div className="settings-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="settings-input"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                className="settings-eye-btn"
                onClick={() => setShowConfirmPassword((p) => !p)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button
              className="settings-save-btn"
              onClick={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? "Saving..." : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    ) : activePage !== "Dashboard" ? (
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
    color: darkMode ? "#ffffff" : "#555",
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
    color: darkMode ? "#ffffff" : "#666",
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
          <div className="recent-col-header">
            <h2>Recent Income</h2>
            <button
              className="view-all-link"
              onClick={() => setActivePage("Income")}
            >
              View All
            </button>
          </div>
          <div className="table-scroll-wrapper">
          <IncomeTable
            incomeList={incomeList.slice(0, 5)}
            handleEditIncome={handleEditIncome}
            handleDeleteIncome={handleDeleteIncome}
          />
          </div>
        </div>

        <div className="recent-col">
          <div className="recent-col-header">
            <h2>Recent Expenses</h2>
            <button
              className="view-all-link"
              onClick={() => setActivePage("Expenses")}
            >
              View All
            </button>
          </div>
          <div className="table-scroll-wrapper">
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
      </div>

      </>
    )}
           </main>
      </div>

      {showAllNotifications && (
        <div
          className="modal-overlay"
          onClick={() => setShowAllNotifications(false)}
        >
          <div
            className="all-notifications-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="all-notifications-header">
              <h2>All Notifications</h2>
              <button
                className="all-notifications-close"
                onClick={() => setShowAllNotifications(false)}
              >
                ✕
              </button>
            </div>

            <div className="all-notifications-list">
              {notifications.length === 0 ? (
                <p className="notif-empty">No notifications yet.</p>
              ) : (
                notifications.map((notification) => (
                  <div className="notif-item" key={notification.id}>
                    <p className="notif-title">{notification.title}</p>
                    <p className="notif-text">{notification.message}</p>
                    <p className="notif-time">
                      {formatRelativeTime(notification.timestamp)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {showCropModal && (
        <div className="modal-overlay" onClick={handleCancelCrop}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
            <div className="all-notifications-header">
              <h2>Edit Profile Picture</h2>
              <button
                className="all-notifications-close"
                onClick={handleCancelCrop}
              >
                ✕
              </button>
            </div>

            <div className="crop-container">
              <Cropper
                image={avatarPreview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="crop-zoom-row">
              <span>Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>

            <div className="crop-modal-actions">
              <button
                className="settings-save-btn"
                onClick={handleSaveCroppedAvatar}
                disabled={savingAvatar}
              >
                {savingAvatar ? "Saving..." : "Save"}
              </button>
              <button className="change-budget-btn" onClick={handleCancelCrop}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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