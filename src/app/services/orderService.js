import { apiClient, isDemoMode } from "./apiClient";

const STORAGE_KEY = "demo-orders";

const readStoredOrders = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeStoredOrders = (orders) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const createOrder = async ({ designId, size, address, notes }) => {
  if (isDemoMode) {
    const nextOrder = {
      id: Date.now(),
      designId,
      size,
      address,
      notes,
      status: "Demo queued",
      createdAt: new Date().toISOString(),
    };
    const orders = [nextOrder, ...readStoredOrders()];
    writeStoredOrders(orders);
    return nextOrder;
  }

  const { data } = await apiClient.post("/orders", {
    designId,
    size,
    address,
    notes,
  });

  return data;
};

export const getMyOrders = async () => {
  if (isDemoMode) return readStoredOrders();

  const { data } = await apiClient.get("/orders/my");
  return data;
};
