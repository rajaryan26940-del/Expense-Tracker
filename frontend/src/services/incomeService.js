import api from "../api/axios";

// Add Income
export const addIncome = async (incomeData) => {
  const response = await api.post("/income/add", incomeData);
  return response.data;
};

// Get All Income
export const getIncome = async () => {
  const response = await api.get("/income");
  return response.data;
};

// Update Income
export const updateIncome = async (id, incomeData) => {
  const response = await api.put(`/income/${id}`, incomeData);
  return response.data;
};

// Delete Income
export const deleteIncome = async (id) => {
  const response = await api.delete(`/income/${id}`);
  return response.data;
};