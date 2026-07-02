/**
 * ThemeContext — manages light/dark mode preference across the entire app.
 *
 * Decision: Promoted from local useState in App.jsx to Context so any
 * future component can read or toggle the theme without prop drilling.
 * The actual CSS class is applied to document.body (existing pattern preserved).
 */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    // Restore from localStorage so preference survives page reloads
    return localStorage.getItem("vspm_theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("vspm_theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = () => setDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * @returns {{ dark: boolean, toggle: () => void }}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}

export default ThemeContext;
