import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import { useThemeMode } from "../App";

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function SettingsModal({ open, onClose, onDeleteAllHistory }) {
  const { darkMode, toggleDarkMode } = useThemeMode();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleClearAll = async () => {
    setDeleting(true);
    setSuccessMessage("");
    try {
      if (onDeleteAllHistory) {
        await onDeleteAllHistory();
      }
      setSuccessMessage("All conversation history cleared successfully.");
      setConfirmingDelete(false);
    } catch {
      // Error handled in parent
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          p: 0.5,
          textAlign: "left",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ color: "#2563eb", display: "flex" }}>
            <SettingsIcon />
          </Box>
          <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
            Settings & Preferences
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2 }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, fontSize: "0.8125rem", py: 0.25 }}>
            {successMessage}
          </Alert>
        )}

        {/* Theme & Appearance */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.8125rem", color: "text.primary", mb: 0.5 }}>
            Theme & Appearance
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ color: darkMode ? "#fbbf24" : "#64748b", display: "flex" }}>
                {darkMode ? <MoonIcon /> : <SunIcon />}
              </Box>
              <Typography variant="body2" sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                Dark Mode
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  size="small"
                  color="primary"
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Data & History */}
        <Box sx={{ pt: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.8125rem", color: "text.primary", mb: 0.5 }}>
            Data & Chat History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.775rem", mb: 1.5 }}>
            Manage stored chat records and conversation logs for your account.
          </Typography>

          {!confirmingDelete ? (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<TrashIcon />}
              onClick={() => setConfirmingDelete(true)}
              sx={{
                borderRadius: "8px",
                fontSize: "0.8125rem",
                fontWeight: 600,
                textTransform: "none",
                borderColor: "#fca5a5",
                color: "#dc2626",
                "&:hover": {
                  borderColor: "#ef4444",
                  bgcolor: darkMode ? "rgba(220, 38, 38, 0.15)" : "#fef2f2",
                },
              }}
            >
              Delete All Conversations
            </Button>
          ) : (
            <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: darkMode ? "rgba(220, 38, 38, 0.15)" : "#fef2f2", border: "1px solid #fecaca" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8125rem", color: darkMode ? "#fca5a5" : "#991b1b", mb: 1 }}>
                Are you sure you want to delete all conversations?
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, fontSize: "0.725rem" }}>
                This will permanently delete all past question history from your account. This action cannot be undone.
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleClearAll}
                  disabled={deleting}
                  sx={{
                    fontSize: "0.775rem",
                    fontWeight: 600,
                    borderRadius: "6px",
                    bgcolor: "#dc2626",
                    "&:hover": { bgcolor: "#b91c1c" },
                  }}
                >
                  {deleting ? <CircularProgress size={14} color="inherit" /> : "Yes, Delete All"}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  sx={{
                    fontSize: "0.775rem",
                    borderRadius: "6px",
                    color: "text.secondary",
                    borderColor: "divider",
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
        <Button variant="contained" size="small" onClick={onClose} sx={{ borderRadius: "8px", fontWeight: 600, px: 2.5, bgcolor: "#2563eb" }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsModal;
