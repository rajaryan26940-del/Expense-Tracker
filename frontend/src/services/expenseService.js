import API from "../api/axios";

export const getExpenses = async () => {
  const response = await API.get("/expenses");
  return response.data;
};