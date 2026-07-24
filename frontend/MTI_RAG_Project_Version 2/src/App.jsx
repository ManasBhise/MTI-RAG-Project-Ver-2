import { useState, createContext, useContext, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getAppTheme } from "./theme";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import ProtectedRoute from "./Components/ProtectedRoute";
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
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </ErrorBoundary>
  );
}

export default App;