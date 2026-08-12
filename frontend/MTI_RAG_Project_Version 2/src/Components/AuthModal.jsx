import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import imdLogo from "../assets/imd_logo.png";
import { loginUser } from "../services/api";
import { useThemeMode } from "../App";

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function ShieldLockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <rect x="9" y="10" width="6" height="5" rx="1"></rect>
      <path d="M10 10V8a2 2 0 0 1 4 0v2"></path>
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9 3 14v7h7l5-5 1.5 1.5L18 16l-1.5-1.5L18 13l1.5 1.5 2.5-2.5a3.5 3.5 0 0 0-1-6.5z"></path>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
}

function AuthModal({ open, onClose, onSuccess }) {
  const { darkMode } = useThemeMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(email.trim(), password.trim());
      if (res && res.user) {
        onSuccess(res.user);
        onClose();
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Authorization failed. Please verify credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: "380px !important",
          borderRadius: "16px",
          bgcolor: darkMode ? "rgba(15, 23, 42, 0.97)" : "#ffffff",
          backdropFilter: "blur(20px)",
          border: "1px solid",
          borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(37, 99, 235, 0.14)",
          boxShadow: darkMode
            ? "0 20px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(37, 99, 235, 0.2)"
            : "0 20px 48px rgba(37, 99, 235, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          p: { xs: 2.25, sm: 2.75 },
        },
      }}
    >
      {/* Top Status & Close Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#22c55e",
              boxShadow: "0 0 6px #22c55e",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: darkMode ? "#93c5fd" : "#2563eb",
            }}
          >
            Officer Verification
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "text.secondary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "6px",
            p: 0.35,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Header with Compact Emblem */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            mx: "auto",
            mb: 1.25,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "14px",
            background: darkMode
              ? "linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(30, 58, 138, 0.4) 100%)"
              : "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(219, 234, 254, 0.8) 100%)",
            border: "1px solid",
            borderColor: darkMode ? "rgba(59, 130, 246, 0.3)" : "rgba(37, 99, 235, 0.2)",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.12)",
          }}
        >
          <Box
            component="img"
            src={imdLogo}
            alt="IMD Official Emblem"
            sx={{
              width: 36,
              height: 36,
              objectFit: "contain",
            }}
          />
        </Box>

        <Typography
          variant="subtitle1"
          component="h2"
          sx={{
            fontWeight: 750,
            fontSize: "1.05rem",
            color: "text.primary",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          MTI Official Authorization
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: "0.6875rem",
            display: "block",
            mt: 0.35,
            lineHeight: 1.25,
            fontWeight: 500,
          }}
        >
          India Meteorological Department • MTI Pune
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Chip
            icon={<ShieldLockIcon />}
            label="RESTRICTED ACCESS"
            size="small"
            sx={{
              height: 19,
              fontSize: "0.575rem",
              fontWeight: 700,
              bgcolor: darkMode ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.08)",
              color: darkMode ? "#93c5fd" : "#1d4ed8",
              border: "1px solid",
              borderColor: darkMode ? "rgba(59, 130, 246, 0.35)" : "rgba(37, 99, 235, 0.25)",
              borderRadius: "4px",
              px: 0.4,
              "& .MuiChip-icon": {
                color: "inherit",
                ml: 0.3,
              },
            }}
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: "8px",
            fontSize: "0.75rem",
            py: 0.5,
            bgcolor: darkMode ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
            border: "1px solid",
            borderColor: darkMode ? "rgba(239, 68, 68, 0.3)" : "#fecaca",
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Form Fields */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: "0.7rem",
              color: "text.secondary",
              mb: 0.5,
              display: "block",
            }}
          >
            Official Email Address
          </Typography>
          <TextField
            placeholder="officer@imd.gov.in"
            type="email"
            size="small"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: darkMode ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                fontSize: "0.8125rem",
                "& input": {
                  py: "7px",
                },
                "&:hover": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused": {
                  boxShadow: "0 0 0 2.5px rgba(37, 99, 235, 0.18)",
                  bgcolor: darkMode ? "rgba(255, 255, 255, 0.06)" : "#ffffff",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: "text.secondary", mr: 0.5 }}>
                  <MailIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: "0.7rem",
              color: "text.secondary",
              mb: 0.5,
              display: "block",
            }}
          >
            Password / Access Key
          </Typography>
          <TextField
            placeholder="••••••••••••"
            type={showPassword ? "text" : "password"}
            size="small"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: darkMode ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                fontSize: "0.8125rem",
                "& input": {
                  py: "7px",
                },
                "&:hover": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused": {
                  boxShadow: "0 0 0 2.5px rgba(37, 99, 235, 0.18)",
                  bgcolor: darkMode ? "rgba(255, 255, 255, 0.06)" : "#ffffff",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: "text.secondary", mr: 0.5 }}>
                  <KeyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    sx={{ color: "text.secondary", p: 0.25 }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          startIcon={loading ? null : <ShieldLockIcon />}
          sx={{
            mt: 0.5,
            py: 0.9,
            borderRadius: "8px",
            fontSize: "0.775rem",
            fontWeight: 650,
            textTransform: "none",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
            transition: "all 0.15s ease-in-out",
            "&:hover": {
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
            },
          }}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : "Authorize & Proceed to Upload"}
        </Button>

        {/* Security Footer Note */}
        <Box
          sx={{
            mt: 0.5,
            p: 1,
            borderRadius: "8px",
            bgcolor: darkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(37, 99, 235, 0.03)",
            border: "1px solid",
            borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(37, 99, 235, 0.1)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: "0.675rem",
              lineHeight: 1.3,
              display: "block",
            }}
          >
            🔒 <strong>256-Bit Encrypted</strong> • Restricted to accredited IMD faculty.
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
}

export default AuthModal;
