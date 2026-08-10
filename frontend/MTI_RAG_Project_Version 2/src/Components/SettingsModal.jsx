import { useEffect, useState } from "react";
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
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useThemeMode } from "../App";
import { fetchUserProfile, getStoredUser, saveSession, updateUserProfile } from "../services/api";
import { formatErrorMessage } from "../utils/formatError";

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

function UserPersonaIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
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

const ROLES = [
  "Trainee Meteorologist",
  "Operational Forecaster",
  "Research Scientist / Academic",
  "Numerical Weather Prediction (NWP) Specialist",
  "Meteorology Student",
  "Aviation Weather Specialist",
  "Hydrometeorologist",
  "Other",
];

const TONES = [
  { id: "moderate", label: "Standard & Balanced (Trainee Level)", desc: "Clear technical terms with explanations" },
  { id: "basic", label: "Simple & Beginner-Friendly", desc: "Everyday language, clear analogies" },
  { id: "research", label: "Expert & Research Level", desc: "In-depth equations, rigorous analysis, bullet points" },
];

function SettingsModal({ open, onClose, onDeleteAllHistory }) {
  const { darkMode, toggleDarkMode } = useThemeMode();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const storedUser = getStoredUser() || {};
  const [name, setName] = useState(storedUser.name || "");
  const [role, setRole] = useState(storedUser.role || "Trainee Meteorologist");
  const [organization, setOrganization] = useState(storedUser.organization || "India Meteorological Department (IMD)");
  const [responseTone, setResponseTone] = useState(storedUser.response_tone || "moderate");
  const [customInstructions, setCustomInstructions] = useState(storedUser.custom_instructions || "");
  const [useEmojis, setUseEmojis] = useState(storedUser.use_emojis ?? true);

  useEffect(() => {
    if (open) {
      setSuccessMessage("");
      setErrorMessage("");
      const loadProfile = async () => {
        try {
          const profile = await fetchUserProfile();
          if (profile) {
            setName(profile.name || "");
            setRole(profile.role || "Trainee Meteorologist");
            setOrganization(profile.organization || "India Meteorological Department (IMD)");
            setResponseTone(profile.response_tone || "moderate");
            setCustomInstructions(profile.custom_instructions || "");
            setUseEmojis(profile.use_emojis ?? true);
            saveSession({ user: profile });
          }
        } catch {
          // Fall back to stored session values
        }
      };
      loadProfile();
    }
  }, [open]);

  const handleSavePersonalization = async () => {
    setSavingProfile(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const updatedUser = await updateUserProfile({
        name: name.trim(),
        role: role.trim(),
        organization: organization.trim(),
        response_tone: responseTone,
        custom_instructions: customInstructions.trim(),
        use_emojis: useEmojis,
      });

      saveSession({ user: updatedUser });
      setSuccessMessage("Personalization preferences saved successfully!");
    } catch (err) {
      setErrorMessage(formatErrorMessage(err?.response?.data?.detail, "Failed to save personalization settings."));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleClearAll = async () => {
    setDeleting(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      if (onDeleteAllHistory) {
        await onDeleteAllHistory();
      }
      setSuccessMessage("All conversation history cleared successfully.");
      setConfirmingDelete(false);
    } catch {
      setErrorMessage("Failed to clear conversation history.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "14px",
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
          <Typography variant="h6" sx={{ fontSize: "1.05rem", fontWeight: 700 }}>
            Assistant Personalization & Settings
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2.5, px: 3, maxHeight: "75vh", overflowY: "auto" }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, fontSize: "0.8125rem", py: 0.25 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "0.8125rem", py: 0.25 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Section 1: User Profile & Personalization */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box sx={{ color: "#2563eb", display: "flex" }}>
              <UserPersonaIcon />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary" }}>
              Personalization & Response Instructions
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.775rem", mb: 2, lineHeight: 1.4 }}>
            Customize your professional background and instructions. The assistant will use these settings for every response.
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                fullWidth
              />
              <FormControl size="small" fullWidth>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  displayEmpty
                  sx={{ fontSize: "0.8375rem" }}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r} value={r} sx={{ fontSize: "0.8125rem" }}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Organization / Department"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. India Meteorological Department (IMD), MTI Pune"
              size="small"
              fullWidth
            />

            <FormControl size="small" fullWidth>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 0.5 }}>
                Default Response Tone & Style:
              </Typography>
              <Select
                value={responseTone}
                onChange={(e) => setResponseTone(e.target.value)}
                sx={{ fontSize: "0.8375rem" }}
              >
                {TONES.map((t) => (
                  <MenuItem key={t.id} value={t.id} sx={{ fontSize: "0.8125rem" }}>
                    <strong>{t.label}</strong> — {t.desc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 0.5, display: "block" }}>
                Custom Assistant Instructions (Used for every query):
              </Typography>
              <TextField
                multiline
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g., Always emphasize numerical weather prediction (NWP) applications and include key mathematical formulas. Use clear bullet points and operational summary points."
                size="small"
                fullWidth
                sx={{ "& .MuiInputBase-input": { fontSize: "0.8125rem" } }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 0.5, px: 0.5, bgcolor: "action.hover", p: 1.25, borderRadius: "8px" }}>
              <Box>
                <Typography variant="body2" sx={{ fontSize: "0.8375rem", fontWeight: 600, color: "text.primary" }}>
                  Use Emojis in Assistant Responses 🌤️
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.725rem", display: "block" }}>
                  Include expressive meteorological emojis for section titles, key takeaways, and bullet points.
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={useEmojis}
                    onChange={(e) => setUseEmojis(e.target.checked)}
                    size="small"
                    color="primary"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSavePersonalization}
                disabled={savingProfile}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 600,
                  px: 2.5,
                  py: 0.75,
                  fontSize: "0.8125rem",
                  bgcolor: "#2563eb",
                  textTransform: "none",
                }}
              >
                {savingProfile ? <CircularProgress size={16} color="inherit" /> : "Save Personalization"}
              </Button>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Section 2: Theme & Appearance */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary", mb: 0.5 }}>
            Theme & Appearance
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ color: darkMode ? "#fbbf24" : "#64748b", display: "flex" }}>
                {darkMode ? <MoonIcon /> : <SunIcon />}
              </Box>
              <Typography variant="body2" sx={{ fontSize: "0.8375rem", fontWeight: 500 }}>
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

        <Divider sx={{ my: 2 }} />

        {/* Section 3: Data & Chat History */}
        <Box sx={{ pt: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary", mb: 0.5 }}>
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
          <Box sx={{ mt: 2.5, p: 1.75, borderRadius: "8px", bgcolor: darkMode ? "rgba(245, 158, 11, 0.1)" : "#fffbeb", border: "1px solid", borderColor: darkMode ? "rgba(245, 158, 11, 0.25)" : "#fef3c7" }}>
            <Typography variant="body2" sx={{ fontWeight: 650, fontSize: "0.8rem", color: darkMode ? "#fbbf24" : "#92400e", mb: 0.5 }}>
              ⚠️ AI Advisory & Verification Disclaimer
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.725rem", lineHeight: 1.5 }}>
              The Meteorological Training Institute (MTI) AI Knowledge Assistant utilizes advanced Large Language Models and Retrieval-Augmented Generation. While designed to retrieve accurate institute courseware, AI models can make mistakes or produce hallucinated interpretations. Users must cross-verify critical weather data, numerical values, and operational procedures with official IMD manuals and publications.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
        <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: "8px", fontWeight: 600, px: 2.5 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsModal;
