import { apiClient, isDemoMode } from "./apiClient";

const uploadFile = async (path, file) => {
  if (isDemoMode) {
    return {
      url: typeof window !== "undefined" ? URL.createObjectURL(file) : "",
      publicId: `demo-${Date.now()}`,
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post(path, formData);
  return data;
};

export const uploadImage = (file) => uploadFile("/upload/image", file);

export const uploadImageWithoutBackground = (file) =>
  uploadFile("/upload/image/remove-bg", file);
