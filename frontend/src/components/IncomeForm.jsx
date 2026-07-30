function IncomeForm({
  incomeTitle,
  setIncomeTitle,
  incomeAmount,
  setIncomeAmount,
  incomeSource,
  setIncomeSource,
  handleSaveIncome,
  incomeEditId,
}) {
  return (
    <div className="dashboard-form">
      <h2 className="dashboard-title">
        {incomeEditId ? "Edit Income" : "Add New Income"}
      </h2>

      <input
        type="text"
        placeholder="Income Title"
        value={incomeTitle}
        onChange={(e) =>
          setIncomeTitle(e.target.value)
        }
      />

      <input
        type="number"
        placeholder="Amount"
        value={incomeAmount}
        onChange={(e) =>
          setIncomeAmount(e.target.value)
        }
      />

      <input
        type="text"
        placeholder="Income Source"
        value={incomeSource}
        onChange={(e) =>
          setIncomeSource(e.target.value)
        }
      />

      <button
        className="save-btn"
        onClick={handleSaveIncome}
      >
        {incomeEditId
          ? "Update Income"
          : "Save Income"}
      </button>
    </div>
  );
}

export default IncomeForm;