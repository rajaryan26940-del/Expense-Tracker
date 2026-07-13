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
  const monthIndex = new Date(expense.createdAt).getMonth();

  monthlyData[monthIndex].total += Number(expense.amount);
});
const categoryData = [
  { name: "Food", value: 0 },
  { name: "Travel", value: 0 },
  { name: "Shopping", value: 0 },
  { name: "Bills", value: 0 },
  { name: "Others", value: 0 },
];
const COLORS = [
  "#3F5FE0",
  "#28A745",
  "#FFC107",
  "#DC3545",
  "#6F42C1",
];

expenses.forEach((expense) => {
  const category = categoryData.find(
    (item) => item.name === expense.category
  );

  if (category) {
    category.value += Number(expense.amount);
  }
});
  return (
 <div className="expense-chart">
   <h2>Expense Statistics</h2>

<div className="average-box">
  <p>Average Expense</p>
  <h3>₹ {averageExpense}</h3>
</div>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="month" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="total"
          fill="#4F46E5"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
   <h3 style={{ textAlign: "center", marginTop: "40px" }}>
  Expense by Category
</h3>

<ResponsiveContainer width="100%" height={350}>
  <PieChart>
   <Pie
  data={categoryData.filter((item) => item.value > 0)}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={110}
      label={({ name }) => name}
    >
      {categoryData.map((entry, index) => (
        <Cell
          key={entry.name}
          fill={COLORS[index % COLORS.length]}
        />
      ))}
    </Pie>

    <Tooltip />

    <Legend />
  </PieChart>
</ResponsiveContainer>
  </div>
);
}

export default ExpenseChart;