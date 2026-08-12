import { Box, Button, Chip, Divider, IconButton, List, ListItemButton, ListItemText, Tooltip, Typography } from "@mui/material";

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

function SidebarCollapseIcon({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.8" />
      <line x1="9" y1="3" x2="9" y2="21" strokeWidth="1.8" />
      <path d="M15 9l-3 3 3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const QUICK_TOPICS = [
  {
    category: "Aviation Weather",
    icon: "🛫",
    prompt: "Explain METAR and TAF meteorological codes and aviation weather hazards.",
  },
  {
    category: "Atmospheric Science",
    icon: "🌡️",
    prompt: "What is Dry Adiabatic Lapse Rate (DALR) and Saturated Adiabatic Lapse Rate?",
  },
  {
    category: "Radar & Satellite",
    icon: "🛰️",
    prompt: "How does Doppler Weather Radar track severe storms and cyclones?",
  },
  {
    category: "Tropical Weather",
    icon: "🌀",
    prompt: "Explain the formation and life cycle of Tropical Cyclones in the North Indian Ocean.",
  },
  {
    category: "NWP & Forecasting",
    icon: "📊",
    prompt: "What is Numerical Weather Prediction (NWP) and how do atmospheric models operate?",
  },
  {
    category: "Oceanography",
    icon: "🌊",
    prompt: "What are ocean currents, SST, and their impact on global weather patterns?",
  },
];

function Sidebar({ onClearChat, onSelectPrompt, onOpenSettings, onToggleCollapse, responseMode = "moderate", onSetResponseMode }) {
  return (
    <Box
      sx={{
        width: { xs: "82vw", sm: 260 },
        maxWidth: 300,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        textAlign: "left",
      }}
    >
      {/* Top Action Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: { xs: 1.5, sm: 2 }, pb: 1.25 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={onClearChat}
          startIcon={<TrashIcon />}
          sx={{
            py: { xs: 0.9, sm: 1 },
            px: 2,
            borderRadius: "10px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            textTransform: "none",
            borderColor: "rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "#ef4444",
              bgcolor: "rgba(239, 68, 68, 0.08)",
              transform: "translateY(-1px)",
            },
          }}
        >
          Clear Active Chat
        </Button>

        {onToggleCollapse && (
          <Tooltip title="Collapse sidebar" placement="bottom">
            <IconButton
              size="small"
              onClick={onToggleCollapse}
              sx={{
                color: "text.secondary",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "9px",
                p: 0.75,
                flexShrink: 0,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: "rgba(37, 99, 235, 0.08)",
                  color: "#2563eb",
                  borderColor: "rgba(37, 99, 235, 0.3)",
                },
              }}
            >
              <SidebarCollapseIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ borderColor: "divider", opacity: 0.6 }} />

      {/* Response Depth / Mode Selector */}
      {onSetResponseMode && (
        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6875rem", display: "block", mb: 1 }}>
            Response Depth
          </Typography>
          <Box sx={{ display: "flex", gap: 0.75 }}>
            {[
              { id: "concise", label: "Concise" },
              { id: "moderate", label: "Moderate" },
              { id: "detailed", label: "Detailed" },
            ].map((mode) => {
              const isSelected = responseMode === mode.id;
              return (
                <Chip
                  key={mode.id}
                  label={mode.label}
                  size="small"
                  onClick={() => onSetResponseMode(mode.id)}
                  sx={{
                    flex: 1,
                    fontSize: "0.725rem",
                    fontWeight: isSelected ? 600 : 500,
                    bgcolor: isSelected ? "primary.main" : "action.hover",
                    color: isSelected ? "#ffffff" : "text.secondary",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: isSelected ? "primary.dark" : "action.selected",
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: "divider", opacity: 0.6, my: 0.5 }} />

      {/* Quick Documentation Modules / Suggested Topics */}
      <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6875rem" }}>
          MTI Knowledge Modules
        </Typography>
      </Box>

      <List sx={{ pt: 0.5, px: 1.25, overflowY: "auto", flex: 1 }}>
        {QUICK_TOPICS.map((topic, index) => (
          <ListItemButton
            key={index}
            onClick={() => onSelectPrompt && onSelectPrompt(topic.prompt)}
            sx={{
              borderRadius: "8px",
              mb: 0.75,
              py: 0.85,
              px: 1.25,
              gap: 1.25,
              border: "1px solid",
              borderColor: "transparent",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "action.hover",
                borderColor: "divider",
                transform: "translateX(2px)",
              },
            }}
          >
            <Typography sx={{ fontSize: "1.1rem", lineHeight: 1 }}>{topic.icon}</Typography>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontSize: "0.8125rem", fontWeight: 500, color: "text.primary" }}>
                  {topic.category}
                </Typography>
              }
              secondary={
                <Typography variant="caption" noWrap sx={{ fontSize: "0.7rem", color: "text.secondary", display: "block" }}>
                  {topic.prompt}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>

      {/* Bottom Footer: Settings */}
      {onOpenSettings && (
        <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button
            fullWidth
            onClick={onOpenSettings}
            startIcon={<SettingsIcon />}
            sx={{
              justifyContent: "flex-start",
              color: "text.secondary",
              fontSize: "0.8125rem",
              fontWeight: 500,
              textTransform: "none",
              borderRadius: "8px",
              py: 0.8,
              px: 1.25,
              "&:hover": {
                bgcolor: "action.hover",
                color: "text.primary",
              },
            }}
          >
            Settings & Personalization
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Sidebar;
