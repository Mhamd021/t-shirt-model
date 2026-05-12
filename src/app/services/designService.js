import { apiClient } from "./apiClient";

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

export const createDesign = async ({ name, shirtColor, decals }) => {
  const { data } = await apiClient.post("/designs", {
    name,
    shirtColor,
    decals: decals.map(toBackendDecal),
  });

  return data;
};

export const getDesigns = async () => {
  const { data } = await apiClient.get("/designs");
  return data;
};

export const getDesign = async (id) => {
  const { data } = await apiClient.get(`/designs/${id}`);
  return data;
};

export const updateDesign = async (id, { name, shirtColor, decals }) => {
  const { data } = await apiClient.put(`/designs/${id}`, {
    name,
    shirtColor,
    decals: decals.map(toBackendDecal),
  });

  return data;
};

export const deleteDesign = async (id) => {
  const { data } = await apiClient.delete(`/designs/${id}`);
  return data;
};
