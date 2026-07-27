import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { loginUser, googleLogin, saveSession } from "../services/api";
import { formatErrorMessage } from "../utils/formatError";
import imdLogo from "../assets/imd_logo.jpg";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "498760101315-6nf42snn76dsehqhrinqccm4hj22ldnc.apps.googleusercontent.com";

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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LogoIcon({ size = 44 }) {
  return (
    <Box
      component="img"
      src={imdLogo}
      alt="IMD Logo"
      sx={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: "8px",
      }}
    />
  );
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGuestLogin = () => {
    const guestToken = `guest_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const guestUser = {
      id: 0,
      name: "Guest Meteorologist",
      email: "guest@mti.gov.in",
      role: "Trainee Meteorologist",
      organization: "India Meteorological Department (IMD)",
      response_tone: "moderate",
      custom_instructions: "",
      use_emojis: true,
    };

    saveSession({ access_token: guestToken, user: guestUser });
    navigate("/chat", { replace: true });
  };

  const handleGoogleCallback = useCallback(
    async (response) => {
      setError("");
      setGoogleLoading(true);

      try {
        const data = await googleLogin(response.credential);
        saveSession(data, rememberMe);
        navigate("/chat", { replace: true });
      } catch (err) {
        const message = formatErrorMessage(
          err?.response?.data?.detail,
          "Google sign-in failed. Please try again."
        );
        setError(message);
      } finally {
        setGoogleLoading(false);
      }
    },
    [navigate, rememberMe]
  );

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove the script if the component unmounts
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [handleGoogleCallback]);

  const handleGoogleClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: use popup mode if One Tap is blocked
          window.google.accounts.id.prompt();
        }
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ email: email.trim(), password });
      saveSession(response, rememberMe);
      navigate("/chat", { replace: true });
    } catch (err) {
      const message = formatErrorMessage(err?.response?.data?.detail, "Login failed. Please verify your credentials.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        textAlign: "left",
      }}
    >
      <Container maxWidth="xs" sx={{ p: 0 }}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            padding: { xs: 3, sm: 4 },
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
            textAlign: "left",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Box
              sx={{
                width: 108,
                height: 108,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
                mb: 1,
              }}
            >
              <LogoIcon size={108} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 700, fontSize: "1.05rem", color: "text.primary", lineHeight: 1.2, textAlign: "center" }}>
                MTI Assistant
              </Typography>
              <Chip
                label="BETA"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  bgcolor: "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                  borderRadius: "4px",
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", textAlign: "center" }}>
              Meteorological Training Institute
            </Typography>
          </Box>

          <Box sx={{ mb: 2.5, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "0.925rem", color: "#0f172a" }}>
              Sign In to Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mt: 0.25 }}>
              Access training modules &amp; meteorological docs
            </Typography>
          </Box>

          {/* Form Fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            <Box sx={{ textAlign: "left" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.725rem", mb: 0.5, display: "block" }}>
                Email Address
              </Typography>
              <TextField
                type="email"
                placeholder="name@mti.gov.in"
                variant="outlined"
                fullWidth
                size="small"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Box>

            <Box sx={{ textAlign: "left" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.725rem", mb: 0.5, display: "block" }}>
                Password
              </Typography>
              <TextField
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                variant="outlined"
                fullWidth
                size="small"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          sx={{ color: "text.secondary" }}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    sx={{ p: 0.5, ml: 0.5, color: "#94a3b8" }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.775rem" }}>
                    Remember me
                  </Typography>
                }
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ py: 0.5, px: 1.5, fontSize: "0.775rem", borderRadius: "6px" }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.1,
                fontSize: "0.8375rem",
                fontWeight: 600,
                bgcolor: "#2563eb",
                borderRadius: "8px",
                mt: 0.5,
                "&:hover": {
                  bgcolor: "#1d4ed8",
                },
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 2, fontSize: "0.725rem", color: "#94a3b8" }}>
            or continue with
          </Divider>

          {/* Google Sign-In Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleClick}
            disabled={googleLoading}
            startIcon={googleLoading ? <CircularProgress size={16} /> : <GoogleIcon />}
            sx={{
              py: 1.1,
              fontSize: "0.8375rem",
              fontWeight: 600,
              textTransform: "none",
              color: "#334155",
              borderColor: "#e2e8f0",
              borderRadius: "8px",
              bgcolor: "#ffffff",
              "&:hover": {
                bgcolor: "#f8fafc",
                borderColor: "#cbd5e1",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              },
            }}
          >
            {googleLoading ? "Signing in..." : "Sign in with Google"}
          </Button>

          {/* Continue as Guest Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGuestLogin}
            sx={{
              py: 1.1,
              mt: 1.25,
              fontSize: "0.8375rem",
              fontWeight: 600,
              textTransform: "none",
              color: "#2563eb",
              borderColor: "#bfdbfe",
              borderRadius: "8px",
              bgcolor: "#eff6ff",
              boxShadow: "0 1px 2px rgba(37, 99, 235, 0.05)",
              "&:hover": {
                bgcolor: "#dbeafe",
                borderColor: "#93c5fd",
                boxShadow: "0 2px 5px rgba(37, 99, 235, 0.12)",
              },
            }}
          >
            ⚡ Continue as Guest (Instant Access)
          </Button>

          <Box mt={3} pt={2} sx={{ borderTop: "1px solid #f1f5f9", textAlign: "left" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.775rem" }}>
              Don&apos;t have an account?{" "}
              <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 600, color: "#2563eb" }}>
                Create account
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;