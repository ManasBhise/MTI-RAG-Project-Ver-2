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

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
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
      <Toolbar sx={{ minHeight: { xs: "52px !important", sm: "56px !important" }, px: { xs: 1.25, sm: 2, md: 3 }, gap: { xs: 0.75, sm: 1.25 } }}>
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
              borderRadius: "8px",
              p: { xs: 0.6, sm: 0.75 },
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: "rgba(37, 99, 235, 0.08)",
                color: "#2563eb",
                borderColor: "rgba(37, 99, 235, 0.3)",
              },
            }}
            aria-label="toggle sidebar"
          >
            <MenuIcon size={18} isSidebarOpen={isSidebarOpen} />
          </IconButton>
        </Tooltip>

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.75, sm: 1.25 }, flexGrow: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: { xs: 28, sm: 34 },
              height: { xs: 28, sm: 34 },
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <LogoIcon size={34} />
          </Box>
          <Box sx={{ textAlign: "left", minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography
                variant="h6"
                component="h1"
                noWrap
                sx={{
                  fontWeight: 650,
                  fontSize: { xs: "0.835rem", sm: "0.925rem" },
                  color: "text.primary",
                  lineHeight: 1.2,
                }}
              >
                MTI Assistant
              </Typography>
              <Chip
                label="BETA"
                size="small"
                sx={{
                  height: 16,
                  fontSize: "0.585rem",
                  fontWeight: 700,
                  bgcolor: darkMode ? "rgba(37, 99, 235, 0.2)" : "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid",
                  borderColor: darkMode ? "rgba(37, 99, 235, 0.4)" : "#bfdbfe",
                  borderRadius: "4px",
                  px: 0.25,
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: "0.685rem", display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
              Meteorological Training Institute • IMD
            </Typography>
          </Box>
          <Chip
            label="Online"
            size="small"
            sx={{
              height: 19,
              fontSize: "0.65rem",
              fontWeight: 600,
              bgcolor: darkMode ? "rgba(22, 163, 74, 0.2)" : "#dcfce7",
              color: darkMode ? "#4ade80" : "#15803d",
              ml: 0.5,
              display: { xs: "none", lg: "inline-flex" },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.6, sm: 1 }, flexShrink: 0 }}>
          {onOpenVoiceControl && (
            <Tooltip title="Voice Command Center" placement="bottom">
              <Button
                variant="contained"
                size="small"
                onClick={onOpenVoiceControl}
                startIcon={<VoiceAssistantIcon />}
                sx={{
                  borderRadius: "18px",
                  fontSize: "0.725rem",
                  fontWeight: 650,
                  py: { xs: 0.35, sm: 0.4 },
                  px: { xs: 1, sm: 1.4 },
                  minWidth: 0,
                  textTransform: "none",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                  "& .MuiButton-startIcon": {
                    mr: { xs: 0, sm: 0.75 },
                    ml: { xs: 0, sm: -0.25 },
                  },
                  "&:hover": {
                    background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Voice Control
                </Box>
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
                p: { xs: 0.55, sm: 0.6 },
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
                  p: { xs: 0.55, sm: 0.6 },
                  "&:hover": { bgcolor: "action.hover", color: "#2563eb" },
                }}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          )}

          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.75 }}>
            <Avatar
              sx={{
                width: 26,
                height: 26,
                fontSize: "0.725rem",
                fontWeight: 600,
                bgcolor: "#2563eb",
                color: "#ffffff",
              }}
            >
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8rem", display: { xs: "none", md: "inline" } }}>
              {userName}
            </Typography>
          </Box>

          {onLogout && (
            <>
              {/* Desktop Reset Button */}
              <Button
                variant="outlined"
                size="small"
                onClick={onLogout}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  fontSize: "0.75rem",
                  py: "3px",
                  px: "8px",
                  color: "text.secondary",
                  borderColor: "divider",
                  textTransform: "none",
                  borderRadius: "6px",
                  "&:hover": {
                    borderColor: "#2563eb",
                    color: "#2563eb",
                    bgcolor: "rgba(37, 99, 235, 0.06)",
                  },
                }}
              >
                Reset Session
              </Button>

              {/* Mobile Reset Icon Button */}
              <Tooltip title="Reset Session" placement="bottom">
                <IconButton
                  size="small"
                  onClick={onLogout}
                  sx={{
                    display: { xs: "inline-flex", sm: "none" },
                    color: "text.secondary",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                    p: 0.55,
                    "&:hover": { color: "#2563eb", bgcolor: "rgba(37, 99, 235, 0.06)" },
                  }}
                >
                  <ResetIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
