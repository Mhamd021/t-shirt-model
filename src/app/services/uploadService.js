import { apiClient } from "./apiClient";

const uploadFile = async (path, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post(path, formData);
  return data;
};

export const uploadImage = (file) => uploadFile("/upload/image", file);

export const uploadImageWithoutBackground = (file) =>
  uploadFile("/upload/image/remove-bg", file);
