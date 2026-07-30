function IncomeTable({
  incomeList,
  handleEditIncome,
  handleDeleteIncome,
}) {
  return (
    <>
      <h2 className="dashboard-title">
        Recent Income
      </h2>

      <table className="dashboard-table">
        <thead>
         <tr>
  <th>Date</th>
  <th>Time</th>
  <th>Title</th>
  <th>Amount</th>
  <th>Source</th>
  <th style={{ width: "170px" }}>Action</th>
</tr>
        </thead>

        <tbody>
  {incomeList.length === 0 ? (
    <tr>
      <td colSpan="6">
        No income found.
      </td>
    </tr>
  ) : (
    incomeList.map((income) => (
      <tr key={income._id}>
        <td>
          {new Date(
            income.createdAt
          ).toLocaleDateString()}
        </td>

        <td>
          {new Date(
            income.createdAt
          ).toLocaleTimeString()}
        </td>

        <td>{income.title}</td>

        <td>₹ {income.amount}</td>

        <td>{income.source}</td>

        <td>
  <div className="income-actions">
    <button
      className="edit-btn"
      onClick={() => handleEditIncome(income)}
    >
      Edit
    </button>

    <button
      className="delete-btn"
      onClick={() => handleDeleteIncome(income._id)}
    >
      Delete
    </button>
  </div>
</td>
      </tr>
    ))
  )}
</tbody>
      </table>
    </>
  );
}

export default IncomeTable;