const Expense = require("../models/Expense");
const isExpenseDue = (expense) => {
  const today = new Date();
  const lastProcessed = new Date(expense.lastProcessed);

  if (expense.recurringType === "Monthly") {
    return (
      today.getMonth() !== lastProcessed.getMonth() ||
      today.getFullYear() !== lastProcessed.getFullYear()
    );
  }

  return false;
};
const createRecurringExpense = async (expense) => {
  console.log(
    `Creating recurring expense: ${expense.title}`
  );

 await Expense.create({
  title: expense.title,
  amount: expense.amount,
  category: expense.category,
  isRecurring: false,
  user: expense.user,
});
expense.lastProcessed = new Date();

await expense.save();
};
const processRecurringExpenses = async () => {
  console.log("Checking recurring expenses...");

  const recurringExpenses = await Expense.find({
    isRecurring: true,
  });

  console.log(
    `Found ${recurringExpenses.length} recurring expense(s).`
  );
  for (const expense of recurringExpenses) {
  const due = isExpenseDue(expense);

  console.log(
    `${expense.title} is ${
      due ? "Due" : "Not Due"
    }`
  );
  if (due) {
  await createRecurringExpense(expense);
}
}
};

module.exports = processRecurringExpenses;