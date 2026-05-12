import { apiClient } from "./apiClient";

export const createOrder = async ({ designId, size, address, notes }) => {
  const { data } = await apiClient.post("/orders", {
    designId,
    size,
    address,
    notes,
  });

  return data;
};

export const getMyOrders = async () => {
  const { data } = await apiClient.get("/orders/my");
  return data;
};
