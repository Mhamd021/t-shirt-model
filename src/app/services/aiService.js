import { apiClient } from "./apiClient";

export const generateDesignSuggestions = async (prompt) => {
  const { data } = await apiClient.post("/ai/design-suggestions", { prompt });
  return data;
};

export const generateColorPalette = async (theme) => {
  const { data } = await apiClient.post("/ai/color-palette", { theme });
  return data;
};

export const generateDecalText = async (context) => {
  const { data } = await apiClient.post("/ai/decal-text", { context });
  return data;
};
