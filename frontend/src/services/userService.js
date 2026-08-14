import API from "../api/axios";

export const updateName = async (name) => {
  const response = await API.put("/user/name", { name });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await API.put("/user/password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};