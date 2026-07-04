function ExpenseForm({
  expenseName,
  setExpenseName,
  amount,
  setAmount,
  category,
  setCategory,
  handleSaveExpense,
  editId,
  handleCancelEdit,
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
<button
  className="save-btn"
  onClick={handleSaveExpense}
>
  {editId ? "Update Expense" : "Save Expense"}
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