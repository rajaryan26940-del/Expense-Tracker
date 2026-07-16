function ExpenseForm({
  expenseName,
  setExpenseName,
  amount,
  setAmount,
  category,
  setCategory,
  receipt,
setReceipt,
  isRecurring,
  setIsRecurring,
  recurringType,
  setRecurringType,
  handleSaveExpense,
  editId,
  handleCancelEdit,
  saving,
}) {
  return (
    <div className="dashboard-form">
      <h2 className="dashboard-title">
  {editId ? "Edit Expense" : "Add New Expense"}
</h2>

      <input
        type="text"
        placeholder="Expense Name"
        value={expenseName}
        onChange={(e) => setExpenseName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option>Food</option>
        <option>Travel</option>
        <option>Shopping</option>
        <option>Bills</option>
        <option>Others</option>
      </select>
     <label
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: "15px 0",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
 <input
  type="checkbox"
  style={{ width: "18px", height: "18px" }}
    checked={isRecurring}
    onChange={(e) =>
      setIsRecurring(e.target.checked)
    }
  />
  Recurring Expense
</label>
{isRecurring && (
  <select
    value={recurringType}
    onChange={(e) =>
      setRecurringType(e.target.value)
    }
  >
    <option value="Monthly">Monthly</option>
    <option value="Weekly">Weekly</option>
    <option value="Yearly">Yearly</option>
  </select>
)}
<div style={{ margin: "15px 0" }}>
  <label
    style={{
      display: "block",
      marginBottom: "8px",
      fontWeight: "bold",
    }}
  >
    Upload Receipt (Optional)
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setReceipt(e.target.files[0])}
  />
</div>
<button
  className="save-btn"
  onClick={handleSaveExpense}
  disabled={saving}
>
  {saving
    ? editId
      ? "Updating..."
      : "Saving..."
    : editId
    ? "Update Expense"
    : "Save Expense"}
</button>
{editId && (
  <button
    className="cancel-btn"
    onClick={handleCancelEdit}
  >
    Cancel Edit
  </button>
)}
    </div>
  );
}

export default ExpenseForm;