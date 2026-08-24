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

export const updateProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append("profilePicture", file);

  const response = await API.put("/user/avatar", formData);
  return response.data;
};