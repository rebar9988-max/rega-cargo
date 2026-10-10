import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { rawGet, rawSet } from "./storage";
type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; setTheme: (value: Theme) => void } | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, updateTheme] = useState<Theme>("light");
  useEffect(() => {
    const saved = rawGet("rl-theme-v1");
    updateTheme(
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
    );
  }, []);
  function setTheme(next: Theme) {
    updateTheme(next);
    rawSet("rl-theme-v1", next);
  }
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("ThemeProvider required");
  return value;
}
