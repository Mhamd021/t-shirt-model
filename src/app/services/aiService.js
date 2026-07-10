import { apiClient, isDemoMode } from "./apiClient";

export const generateDesignSuggestions = async (prompt) => {
  if (isDemoMode) {
    return {
      suggestions: [
        `Demo detail: ${prompt || "your concept"} is ready for visual exploration.`,
        "Try a bold graphic, a clean monogram, or a retro stripe pattern.",
      ],
      mode: "demo",
    };
  }

  const { data } = await apiClient.post("/ai/design-suggestions", { prompt });
  return data;
};

export const generateColorPalette = async (theme) => {
  if (isDemoMode) {
    return {
      palette: ["#0f766e", "#ef5b45", "#f4c542", "#5b4bdb"],
      mode: "demo",
    };
  }

  const { data } = await apiClient.post("/ai/color-palette", { theme });
  return data;
};

export const generateDecalText = async (context) => {
  if (isDemoMode) {
    return {
      text: `Demo text for ${context || "your concept"}`,
      mode: "demo",
    };
  }

  const { data } = await apiClient.post("/ai/decal-text", { context });
  return data;
};
