import { createTheme } from "@mui/material/styles";

export const getAppTheme = (mode = "light") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: "#2563eb",
        light: "#3b82f6",
        dark: "#1d4ed8",
        contrastText: "#ffffff",
      },
      secondary: {
        main: isDark ? "#94a3b8" : "#475569",
      },
      background: {
        default: isDark ? "#0b0f19" : "#f8fafc",
        paper: isDark ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f8fafc" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#475569",
      },
      divider: isDark ? "#334155" : "#e2e8f0",
      action: {
        hover: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.04)",
        selected: isDark ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.08)",
      },
    },
    typography: {
      fontFamily: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        "sans-serif",
      ].join(","),
      fontSize: 14,
      h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.015em" },
      h3: { fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.01em" },
      h4: { fontSize: "1.125rem", fontWeight: 600 },
      h5: { fontSize: "1rem", fontWeight: 600 },
      h6: { fontSize: "0.875rem", fontWeight: 600 },
      body1: { fontSize: "0.875rem", lineHeight: 1.5, letterSpacing: "-0.006em" },
      body2: { fontSize: "0.8125rem", lineHeight: 1.45, letterSpacing: "-0.005em" },
      button: { textTransform: "none", fontWeight: 500, fontSize: "0.875rem" },
      caption: { fontSize: "0.75rem", lineHeight: 1.4 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
          sizeSmall: {
            fontSize: "0.775rem",
            padding: "4px 10px",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
          rounded: {
            borderRadius: 10,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontSize: "0.875rem",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#475569" : "#cbd5e1",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2563eb",
              borderWidth: "1.5px",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontSize: "0.75rem",
            borderRadius: 6,
          },
        },
      },
    },
  });
};

const theme = getAppTheme("light");
export default theme;
