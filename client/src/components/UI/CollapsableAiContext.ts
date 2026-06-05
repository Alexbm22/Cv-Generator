import { createContext } from "react";

export const CollapsableAiContext = createContext<{
  aiOpen: boolean;
  toggleAi: () => void;
} | null>(null);
