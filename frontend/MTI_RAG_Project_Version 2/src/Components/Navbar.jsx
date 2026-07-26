import { AppBar, Avatar, Box, Button, Chip, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import imdLogo from "../assets/imd_logo.jpg";

function MenuIcon({ size = 19, isSidebarOpen = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.8" />
      <line x1="9" y1="3" x2="9" y2="21" strokeWidth="1.8" />
      <path d={isSidebarOpen ? "M15 9l-3 3 3 3" : "M12 9l3 3-3 3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoIcon({ size = 32 }) {
  return (
    <Box
      component="img"
      src={imdLogo}
      alt="IMD Logo"
      sx={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: "6px",
      }}
    />
  );
}

import { useThemeMode } from "../App";

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

function VoiceAssistantIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

function Navbar({ onToggleSidebar, isSidebarOpen = true, userName = "User", onLogout, onOpenHistory, onDownloadConversation, onOpenVoiceControl }) {
  const { darkMode, toggleDarkMode } = useThemeMode();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ minHeight: "56px !important", px: { xs: 2, sm: 3 }, gap: 1.5 }}>
        <Tooltip title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"} placement="bottom">
          <IconButton
            onClick={onToggleSidebar}
            edge="start"
            size="small"
            sx={{
              display: { xs: "inline-flex", md: isSidebarOpen ? "none" : "inline-flex" },
              color: "text.secondary",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "9px",
              p: 0.75,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: "rgba(37, 99, 235, 0.08)",
                color: "#2563eb",
                borderColor: "rgba(37, 99, 235, 0.3)",
                transform: "scale(1.05)",
              },
            }}
            aria-label="toggle sidebar"
          >
            <MenuIcon isSidebarOpen={isSidebarOpen} />
          </IconButton>
        </Tooltip>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexGrow: 1 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <LogoIcon size={34} />
          </Box>
          <Box sx={{ textAlign: "left" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 600, fontSize: "0.925rem", color: "text.primary", lineHeight: 1.2 }}>
                MTI Knowledge Assistant
              </Typography>
              <Chip
                label="BETA"
                size="small"
                sx={{
                  height: 17,
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  bgcolor: darkMode ? "rgba(37, 99, 235, 0.2)" : "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid",
                  borderColor: darkMode ? "rgba(37, 99, 235, 0.4)" : "#bfdbfe",
                  borderRadius: "4px",
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", display: { xs: "none", sm: "block" } }}>
              Meteorological Training Institute • India Meteorological Department
            </Typography>
          </Box>
          <Chip
            label="Online"
            size="small"
            sx={{
              height: 20,
              fontSize: "0.675rem",
              fontWeight: 600,
              bgcolor: darkMode ? "rgba(22, 163, 74, 0.2)" : "#dcfce7",
              color: darkMode ? "#4ade80" : "#15803d",
              ml: 1,
              display: { xs: "none", md: "inline-flex" },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>

          {onOpenVoiceControl && (
            <Tooltip title="Voice Command Center — Control app features hands-free" placement="bottom">
              <Button
                variant="contained"
                size="small"
                onClick={onOpenVoiceControl}
                startIcon={<VoiceAssistantIcon />}
                sx={{
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 650,
                  py: 0.4,
                  px: 1.5,
                  textTransform: "none",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
                  },
                }}
              >
                Voice Control
              </Button>
            </Tooltip>
          )}

          <Tooltip title={darkMode ? "Switch to Light mode" : "Switch to Dark mode"} placement="bottom">
            <IconButton
              onClick={toggleDarkMode}
              size="small"
              sx={{
                color: darkMode ? "#fbbf24" : "text.secondary",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                p: 0.6,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </IconButton>
          </Tooltip>

          {onOpenHistory && (
            <Tooltip title="Thread history menu" placement="bottom">
              <IconButton
                onClick={onOpenHistory}
                size="small"
                sx={{
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "8px",
                  p: 0.6,
                  "&:hover": { bgcolor: "action.hover", color: "#2563eb" },
                }}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: "#2563eb",
                color: "#ffffff",
              }}
            >
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8125rem", display: { xs: "none", sm: "inline" } }}>
              {userName}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={onLogout}
            sx={{
              fontSize: "0.775rem",
              py: "3px",
              px: "10px",
              color: "text.secondary",
              borderColor: "#cbd5e1",
              textTransform: "none",
              borderRadius: "6px",
              "&:hover": {
                borderColor: "#94a3b8",
                bgcolor: "#f1f5f9",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
