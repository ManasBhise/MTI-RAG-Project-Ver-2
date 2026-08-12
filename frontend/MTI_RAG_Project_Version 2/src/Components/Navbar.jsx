import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import imdLogo from "../assets/imd_logo.png";
import { useThemeMode } from "../App";

function LogoIcon({ size = 28 }) {
  return (
    <Box
      component="img"
      src={imdLogo}
      alt="India Meteorological Department Logo"
      sx={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
      }}
    />
  );
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );
}

function UploadPdfIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <polyline points="9 15 12 12 15 15"></polyline>
      <line x1="12" y1="12" x2="12" y2="18"></line>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function VoiceAssistantIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
  onUploadPdf,
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
      <Toolbar
        sx={{
          minHeight: { xs: "44px !important", sm: "48px !important" },
          px: { xs: 1.5, sm: 2.5, md: 3 },
          gap: { xs: 0.75, sm: 1 },
        }}
      >
        {/* Brand & Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LogoIcon size={26} />
          </Box>
          <Box sx={{ textAlign: "left", minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Typography
                variant="subtitle2"
                component="h1"
                noWrap
                sx={{
                  fontWeight: 650,
                  fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                  color: "text.primary",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                MTI Assistant
              </Typography>
              <Chip
                label="BETA"
                size="small"
                sx={{
                  height: 15,
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  bgcolor: darkMode ? "rgba(37, 99, 235, 0.2)" : "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid",
                  borderColor: darkMode ? "rgba(37, 99, 235, 0.4)" : "#bfdbfe",
                  borderRadius: "3px",
                  px: 0.15,
                }}
              />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                fontSize: "0.65rem",
                display: { xs: "none", sm: "block" },
                lineHeight: 1.15,
                opacity: 0.85,
              }}
            >
              Meteorological Training Institute • India Meteorological Department (IMD)
            </Typography>
          </Box>
          <Chip
            label="Online"
            size="small"
            sx={{
              height: 16,
              fontSize: "0.6rem",
              fontWeight: 600,
              bgcolor: darkMode ? "rgba(22, 163, 74, 0.2)" : "#dcfce7",
              color: darkMode ? "#4ade80" : "#15803d",
              ml: 0.5,
              display: { xs: "none", md: "inline-flex" },
            }}
          />
        </Box>

        {/* Toolbar Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 0.75 }, flexShrink: 0 }}>
          {onUploadPdf && (
            <Tooltip title="Upload new PDF manual (Requires authentication)" placement="bottom">
              <Button
                variant="outlined"
                size="small"
                onClick={onUploadPdf}
                startIcon={<UploadPdfIcon />}
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.725rem",
                  fontWeight: 600,
                  py: "2px",
                  px: { xs: 0.8, sm: 1.1 },
                  minWidth: 0,
                  textTransform: "none",
                  borderColor: "rgba(37, 99, 235, 0.35)",
                  color: "#2563eb",
                  bgcolor: "rgba(37, 99, 235, 0.05)",
                  "& .MuiButton-startIcon": {
                    mr: { xs: 0, sm: 0.5 },
                  },
                  "&:hover": {
                    borderColor: "#2563eb",
                    bgcolor: "rgba(37, 99, 235, 0.1)",
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Upload new pdf
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
                  borderRadius: "6px",
                  fontSize: "0.725rem",
                  fontWeight: 600,
                  py: "2.5px",
                  px: { xs: 0.8, sm: 1.1 },
                  minWidth: 0,
                  textTransform: "none",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  boxShadow: "0 1px 4px rgba(37, 99, 235, 0.2)",
                  "& .MuiButton-startIcon": {
                    mr: { xs: 0, sm: 0.5 },
                    ml: 0,
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
                  borderRadius: "6px",
                  p: 0.45,
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
                borderRadius: "6px",
                p: 0.45,
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
                  borderRadius: "6px",
                  p: 0.45,
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
                  fontSize: "0.725rem",
                  fontWeight: 600,
                  py: "2px",
                  px: { xs: 0.6, sm: 0.9 },
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  textTransform: "none",
                  borderRadius: "6px",
                  minWidth: 0,
                  "& .MuiButton-startIcon": {
                    mr: { xs: 0, sm: 0.4 },
                  },
                  "&:hover": {
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    bgcolor: "rgba(239, 68, 68, 0.08)",
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Clear
                </Box>
              </Button>
            </Tooltip>
          )}

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.6, pl: 0.4 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                fontSize: "0.7rem",
                fontWeight: 600,
                bgcolor: "#2563eb",
                color: "#ffffff",
              }}
            >
              {userName?.charAt(0)?.toUpperCase() || "M"}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: "0.75rem", color: "text.secondary" }}>
              {userName}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
