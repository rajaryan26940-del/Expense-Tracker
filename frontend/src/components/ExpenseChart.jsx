import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function ExpenseChart({
  expenses,
  averageExpense,
}) {
  const currentYear = new Date().getFullYear();

  const monthlyData = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].map((month) => ({
    month,
    total: 0,
  }));

  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.createdAt);

    if (expenseDate.getFullYear() === currentYear) {
      monthlyData[expenseDate.getMonth()].total += Number(expense.amount);
    }
  });

  const categoryColors = {
    Food: "#3F5FE0",
    Travel: "#28A745",
    Shopping: "#FFC107",
    Bills: "#DC3545",
    Others: "#6F42C1",
  };

  const categoryData = [
    { name: "Food", value: 0 },
    { name: "Travel", value: 0 },
    { name: "Shopping", value: 0 },
    { name: "Bills", value: 0 },
    { name: "Others", value: 0 },
  ];

  expenses.forEach((expense) => {
    const category = categoryData.find(
      (item) => item.name === expense.category
    );

    if (category) {
      category.value += Number(expense.amount);
    }
  });

  const totalCategoryValue = categoryData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const visibleCategoryData = categoryData.filter(
    (item) => item.value > 0
  );

  return (
    <div className="expense-chart">
      <h2>Expense Statistics</h2>

      <div
  className="chart-row"
  style={{
    display: "grid",
    gridTemplateColumns: "60% 40%",
    gap: "24px",
    width: "100%",
  }}
>
        <div className="chart-col">
          <div className="chart-col-header">
            <h3>Monthly Expense ({currentYear})</h3>
            <span className="chart-average">
              Average: ₹ {averageExpense}
            </span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
           <BarChart
  data={monthlyData}
  margin={{
    top: 10,
    right: 5,
    left: -20,
    bottom: 20,
  }}
  barCategoryGap="18%"
>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
  dataKey="month"
  interval={0}
  tick={{ fontSize: 11 }}
/>

              <YAxis tick={{ fontSize: 11 }} />

              <Tooltip />

              <Bar
  dataKey="total"
  fill="#4F46E5"
  radius={[6, 6, 0, 0]}
  barSize={24}
/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-col">
          <h3 className="chart-col-title">Expense by Category</h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
  data={visibleCategoryData}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  innerRadius={48}
  outerRadius={72}
  paddingAngle={2}
>
                {visibleCategoryData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={categoryColors[entry.name]}
                  />
                ))}
              </Pie>

              <Tooltip />

             
            </PieChart>
          </ResponsiveContainer>
          <div className="custom-legend">
  {visibleCategoryData.map((item) => {
    const percent =
      totalCategoryValue > 0
        ? ((item.value / totalCategoryValue) * 100).toFixed(1)
        : 0;

    return (
      <div key={item.name} className="legend-item">
        <span
          className="legend-color"
          style={{ backgroundColor: categoryColors[item.name] }}
        ></span>

        <span className="legend-text">
          {item.name} ({percent}%)
        </span>
      </div>
    );
  })}
</div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseChart;