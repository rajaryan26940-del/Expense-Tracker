import API from "../api/axios";

export const getExpenses = async () => {
  const response = await API.get("/expenses");
  return response.data;
};
export const addExpense = async (expenseData) => {
  const response = await API.post("/expenses/add", expenseData);
  return response.data;
};