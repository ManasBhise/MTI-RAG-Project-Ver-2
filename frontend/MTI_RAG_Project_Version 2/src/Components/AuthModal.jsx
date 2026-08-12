import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import imdLogo from "../assets/imd_logo.png";
import { loginUser } from "../services/api";

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
}

function AuthModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email address and password.");
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
      const msg = err?.response?.data?.detail || err?.message || "Authorization failed. Please check your credentials.";
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
          borderRadius: "18px",
          bgcolor: "background.paper",
          backgroundImage: "none",
          overflow: "hidden",
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton size="small" onClick={onClose} disabled={loading} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Official IMD Login Header */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Box
          component="img"
          src={imdLogo}
          alt="IMD Official Emblem"
          sx={{
            width: 72,
            height: 72,
            objectFit: "contain",
            mx: "auto",
            mb: 1.5,
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.12))",
          }}
        />

        <Typography variant="h6" component="h2" sx={{ fontWeight: 750, fontSize: "1.2rem", color: "text.primary", lineHeight: 1.2 }}>
          MTI Official Authorization
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.775rem", display: "block", mt: 0.5, lineHeight: 1.3 }}>
          India Meteorological Department • Meteorological Training Institute
        </Typography>

        <Chip
          label="RESTRICTED ACCESS"
          size="small"
          sx={{
            mt: 1.5,
            height: 20,
            fontSize: "0.625rem",
            fontWeight: 750,
            bgcolor: "rgba(37, 99, 235, 0.12)",
            color: "#2563eb",
            border: "1px solid rgba(37, 99, 235, 0.3)",
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px", fontSize: "0.8125rem" }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Official Email Address"
          placeholder="name@imd.gov.in"
          type="email"
          size="small"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ color: "text.secondary" }}>
                <MailIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Password"
          placeholder="••••••••"
          type={showPassword ? "text" : "password"}
          size="small"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ color: "text.secondary" }}>
                <LockIcon />
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

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 1,
            py: 1.1,
            borderRadius: "10px",
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "none",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
            },
          }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : "Authorize & Proceed to Upload"}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", fontSize: "0.725rem", mt: 1 }}>
          Knowledge base uploads are restricted to authorized MTI faculty and meteorological officers.
        </Typography>
      </Box>
    </Dialog>
  );
}

export default AuthModal;
