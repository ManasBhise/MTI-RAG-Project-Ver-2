import { useState, createContext, useContext, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getAppTheme } from "./theme";

import Chat from "./pages/Chat";
import ErrorBoundary from "./Components/ErrorBoundary";

const ThemeModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mti_theme") === "dark";
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("mti_theme", next ? "dark" : "light");
      return next;
    });
  };

  const theme = useMemo(() => getAppTheme(darkMode ? "dark" : "light"), [darkMode]);

  return (
    <ErrorBoundary>
      <ThemeModeContext.Provider value={{ darkMode, toggleDarkMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="*" element={<Chat />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </ErrorBoundary>
  );
}

export default App;