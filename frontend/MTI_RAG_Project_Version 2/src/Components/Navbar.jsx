import { AppBar, Avatar, Box, Button, Chip, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import imdLogo from "../assets/imd_logo.png";
import { useThemeMode } from "../App";

function LogoIcon({ size = { xs: 36, sm: 44 } }) {
  return (
    <Box
      component="img"
      src={imdLogo}
      alt="IMD Logo"
      sx={{
        width: "auto",
        height: size,
        maxHeight: size,
        objectFit: "contain",
        display: "block",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.08))",
      }}
    />
  );
}

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

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

function BookLibraryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      <line x1="12" y1="6" x2="16" y2="6"></line>
      <line x1="12" y1="10" x2="16" y2="10"></line>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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

function Navbar({
  userName = "Meteorologist",
  onClearChat,
  onOpenSettings,
  onOpenDocuments,
  onDownloadConversation,
  onOpenVoiceControl,
}) {
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
      }}
    >
      <Toolbar sx={{ minHeight: { xs: "54px !important", sm: "60px !important" }, px: { xs: 1.5, sm: 2.5, md: 4 }, gap: { xs: 1, sm: 1.5 } }}>
        {/* Brand & Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, flexGrow: 1, minWidth: 0 }}>
          <Box
            sx={{
              height: { xs: 36, sm: 44 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LogoIcon size={{ xs: 36, sm: 44 }} />
          </Box>
          <Box sx={{ textAlign: "left", minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography
                variant="h6"
                component="h1"
                noWrap
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
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
                  height: 17,
                  fontSize: "0.6rem",
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
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: "0.7rem", display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
              Meteorological Training Institute • India Meteorological Department (IMD)
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
              display: { xs: "none", md: "inline-flex" },
            }}
          />
        </Box>

        {/* Toolbar Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.6, sm: 1 }, flexShrink: 0 }}>
          {onOpenDocuments && (
            <Tooltip title="Knowledge Library & Upload PDF Manuals" placement="bottom">
              <Button
                variant="outlined"
                size="small"
                onClick={onOpenDocuments}
                startIcon={<BookLibraryIcon />}
                sx={{
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 650,
                  py: "4px",
                  px: { xs: 1, sm: 1.4 },
                  minWidth: 0,
                  textTransform: "none",
                  borderColor: "rgba(37, 99, 235, 0.35)",
                  color: "#2563eb",
                  bgcolor: "rgba(37, 99, 235, 0.06)",
                  "& .MuiButton-startIcon": {
                    mr: { xs: 0, sm: 0.6 },
                  },
                  "&:hover": {
                    borderColor: "#2563eb",
                    bgcolor: "rgba(37, 99, 235, 0.12)",
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Knowledge Library
                </Box>
              </Button>
            </Tooltip>
          )}

          {onOpenVoiceControl && (
            <Tooltip title="Voice Command Center" placement="bottom">
              <Button
                variant="contained"
                size="small"
                onClick={onOpenVoiceControl}
                startIcon={<VoiceAssistantIcon />}
                sx={{
                  borderRadius: "18px",
                  fontSize: "0.75rem",
                  fontWeight: 650,
                  py: { xs: 0.4, sm: 0.45 },
                  px: { xs: 1.1, sm: 1.5 },
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

          {onDownloadConversation && (
            <Tooltip title="Export conversation as PDF" placement="bottom">
              <IconButton
                onClick={onDownloadConversation}
                size="small"
                sx={{
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "8px",
                  p: { xs: 0.6, sm: 0.65 },
                  "&:hover": { bgcolor: "action.hover", color: "#2563eb" },
                }}
              >
                <DownloadIcon />
              </IconButton>
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
                p: { xs: 0.6, sm: 0.65 },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </IconButton>
          </Tooltip>

          {onOpenSettings && (
            <Tooltip title="Settings & Personalization" placement="bottom">
              <IconButton
                onClick={onOpenSettings}
                size="small"
                sx={{
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "8px",
                  p: { xs: 0.6, sm: 0.65 },
                  "&:hover": { bgcolor: "action.hover", color: "#2563eb" },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}

          {onClearChat && (
            <Tooltip title="Clear Active Chat" placement="bottom">
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={onClearChat}
                startIcon={<TrashIcon />}
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  py: "4px",
                  px: { xs: "8px", sm: "12px" },
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  textTransform: "none",
                  borderRadius: "8px",
                  minWidth: 0,
                  "& .MuiButton-startIcon": {
                    mr: { xs: 0, sm: 0.5 },
                  },
                  "&:hover": {
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    bgcolor: "rgba(239, 68, 68, 0.08)",
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Clear Chat
                </Box>
              </Button>
            </Tooltip>
          )}

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.75, pl: 0.5 }}>
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
              {userName?.charAt(0)?.toUpperCase() || "M"}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8125rem" }}>
              {userName}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
