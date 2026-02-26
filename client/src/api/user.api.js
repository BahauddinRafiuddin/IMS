import api from "./axios";

export const getMyProfile = async () => {
  const res = await api.get("/user/profile");
  return res.data;
};

export const changePassword = async (data) => {
  const res = await api.put("/user/update-pass", data);
  return res.data;
};