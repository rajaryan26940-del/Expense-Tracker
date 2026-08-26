import API from "../api/axios";

export const loginUser = async (userData) => {
  const response = await API.post("/auth/login", userData);
  return response.data;
};
export const registerUser = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await API.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};