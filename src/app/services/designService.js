import { apiClient, isDemoMode } from "./apiClient";

const STORAGE_KEY = "demo-designs";

const toBackendDecal = (decal) => ({
  type: decal.type === "text" ? "TEXT" : "IMAGE",
  side: decal.side,
  positionX: decal.position.x,
  positionY: decal.position.y,
  positionZ: decal.position.z,
  orientationX: decal.orientation.x,
  orientationY: decal.orientation.y,
  orientationZ: decal.orientation.z,
  scaleX: decal.size.x,
  scaleY: decal.size.y,
  scaleZ: decal.size.z,
  text: decal.type === "text" ? decal.label : undefined,
  font: decal.type === "text" ? decal.font : undefined,
  fontSize: decal.type === "text" ? decal.fontSize : undefined,
  textColor: decal.type === "text" ? decal.textColor : undefined,
  imageUrl: decal.type === "image" ? decal.imageUrl : undefined,
  publicId: decal.type === "image" ? decal.publicId : undefined,
});

const readStoredDesigns = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeStoredDesigns = (designs) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
};

export const createDesign = async ({ name, shirtColor, decals }) => {
  if (isDemoMode) {
    const nextDesign = {
      id: Date.now(),
      name,
      shirtColor,
      decals,
      createdAt: new Date().toISOString(),
      demo: true,
    };
    const savedDesigns = [nextDesign, ...readStoredDesigns()];
    writeStoredDesigns(savedDesigns);
    return nextDesign;
  }

  const { data } = await apiClient.post("/designs", {
    name,
    shirtColor,
    decals: decals.map(toBackendDecal),
  });

  return data;
};

export const getDesigns = async () => {
  if (isDemoMode) return readStoredDesigns();

  const { data } = await apiClient.get("/designs");
  return data;
};

export const getDesign = async (id) => {
  if (isDemoMode) {
    return readStoredDesigns().find((design) => design.id === Number(id)) || null;
  }

  const { data } = await apiClient.get(`/designs/${id}`);
  return data;
};

export const updateDesign = async (id, { name, shirtColor, decals }) => {
  if (isDemoMode) {
    const savedDesigns = readStoredDesigns();
    const nextDesigns = savedDesigns.map((design) =>
      design.id === Number(id)
        ? { ...design, name, shirtColor, decals, updatedAt: new Date().toISOString() }
        : design
    );
    writeStoredDesigns(nextDesigns);
    return nextDesigns.find((design) => design.id === Number(id)) || null;
  }

  const { data } = await apiClient.put(`/designs/${id}`, {
    name,
    shirtColor,
    decals: decals.map(toBackendDecal),
  });

  return data;
};

export const deleteDesign = async (id) => {
  if (isDemoMode) {
    const savedDesigns = readStoredDesigns().filter((design) => design.id !== Number(id));
    writeStoredDesigns(savedDesigns);
    return { success: true };
  }

  const { data } = await apiClient.delete(`/designs/${id}`);
  return data;
};
