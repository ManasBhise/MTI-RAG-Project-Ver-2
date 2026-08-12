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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function ShieldLockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <rect x="9" y="10" width="6" height="5" rx="1"></rect>
      <path d="M10 10V8a2 2 0 0 1 4 0v2"></path>
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9 3 14v7h7l5-5 1.5 1.5L18 16l-1.5-1.5L18 13l1.5 1.5 2.5-2.5a3.5 3.5 0 0 0-1-6.5z"></path>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      setError("Please enter both your official email and password.");
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
      const msg = err?.response?.data?.detail || err?.message || "Authorization failed. Please verify your credentials.";
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
          borderRadius: "24px",
          bgcolor: darkMode ? "rgba(15, 23, 42, 0.96)" : "#ffffff",
          backdropFilter: "blur(28px)",
          border: "1px solid",
          borderColor: darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(37, 99, 235, 0.16)",
          boxShadow: darkMode
            ? "0 28px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(37, 99, 235, 0.25)"
            : "0 28px 64px rgba(37, 99, 235, 0.16), 0 8px 24px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          p: { xs: 3, sm: 4 },
          position: "relative",
        },
      }}
    >
      {/* Top Header Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: "#22c55e",
              boxShadow: "0 0 8px #22c55e",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.685rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: darkMode ? "#93c5fd" : "#2563eb",
            }}
          >
            Officer Verification Portal
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
            borderRadius: "8px",
            p: 0.5,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Official Emblem & Badge Header */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Box
          sx={{
            width: 76,
            height: 76,
            mx: "auto",
            mb: 1.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "20px",
            background: darkMode
              ? "linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(30, 58, 138, 0.5) 100%)"
              : "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(219, 234, 254, 0.85) 100%)",
            border: "1px solid",
            borderColor: darkMode ? "rgba(59, 130, 246, 0.35)" : "rgba(37, 99, 235, 0.25)",
            boxShadow: "0 8px 24px rgba(37, 99, 235, 0.18)",
          }}
        >
          <Box
            component="img"
            src={imdLogo}
            alt="IMD Official Emblem"
            sx={{
              width: 54,
              height: 54,
              objectFit: "contain",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))",
            }}
          />
        </Box>

        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: "1.25rem",
            color: "text.primary",
            letterSpacing: "-0.015em",
            lineHeight: 1.25,
          }}
        >
          MTI Official Authorization
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: "0.75rem",
            display: "block",
            mt: 0.5,
            lineHeight: 1.3,
            fontWeight: 500,
          }}
        >
          India Meteorological Department • Meteorological Training Institute
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
          <Chip
            icon={<ShieldLockIcon />}
            label="RESTRICTED ACCESS • LEVEL 2"
            size="small"
            sx={{
              height: 22,
              fontSize: "0.625rem",
              fontWeight: 750,
              bgcolor: darkMode ? "rgba(37, 99, 235, 0.22)" : "rgba(37, 99, 235, 0.08)",
              color: darkMode ? "#93c5fd" : "#1d4ed8",
              border: "1px solid",
              borderColor: darkMode ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.28)",
              borderRadius: "6px",
              px: 0.5,
              "& .MuiChip-icon": {
                color: "inherit",
                ml: 0.5,
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
            mb: 2.5,
            borderRadius: "10px",
            fontSize: "0.8125rem",
            fontWeight: 500,
            bgcolor: darkMode ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
            border: "1px solid",
            borderColor: darkMode ? "rgba(239, 68, 68, 0.3)" : "#fecaca",
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Authorization Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 650,
              fontSize: "0.75rem",
              color: "text.secondary",
              mb: 0.75,
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
                borderRadius: "10px",
                bgcolor: darkMode ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused": {
                  boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.2)",
                  bgcolor: darkMode ? "rgba(255, 255, 255, 0.06)" : "#ffffff",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: "text.secondary", mr: 0.75 }}>
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
              fontWeight: 650,
              fontSize: "0.75rem",
              color: "text.secondary",
              mb: 0.75,
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
                borderRadius: "10px",
                bgcolor: darkMode ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused": {
                  boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.2)",
                  bgcolor: darkMode ? "rgba(255, 255, 255, 0.06)" : "#ffffff",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: "text.secondary", mr: 0.75 }}>
                  <KeyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    sx={{ color: "text.secondary" }}
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
            mt: 0.75,
            py: 1.25,
            borderRadius: "12px",
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "none",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #172554 100%)",
              boxShadow: "0 6px 20px rgba(37, 99, 235, 0.45)",
              transform: "translateY(-1px)",
            },
          }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : "Authorize & Proceed to Upload"}
        </Button>

        {/* Security Footer Note */}
        <Box
          sx={{
            mt: 1,
            p: 1.25,
            borderRadius: "10px",
            bgcolor: darkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(37, 99, 235, 0.03)",
            border: "1px solid",
            borderColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(37, 99, 235, 0.12)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: "0.715rem",
              lineHeight: 1.35,
              display: "block",
            }}
          >
            🔒 <strong>256-Bit SSL Encrypted</strong>. Knowledge base uploads are restricted to authorized MTI faculty and meteorological officers.
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
}

export default AuthModal;
