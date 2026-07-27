import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { registerUser } from "../services/api";
import { formatErrorMessage } from "../utils/formatError";
import imdLogo from "../assets/imd_logo.jpg";

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

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/", { replace: true }), 800);
    } catch (err) {
      const message = formatErrorMessage(err?.response?.data?.detail, "Registration failed. Please try again.");
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
              Create an Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mt: 0.25 }}>
              Register to access the training knowledge base
            </Typography>
          </Box>

          {/* Form Fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ textAlign: "left" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.725rem", mb: 0.5, display: "block" }}>
                Full Name
              </Typography>
              <TextField
                type="text"
                placeholder="Full Name"
                variant="outlined"
                fullWidth
                size="small"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </Box>

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
                placeholder="At least 8 characters"
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

            <Box sx={{ textAlign: "left" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.725rem", mb: 0.5, display: "block" }}>
                Confirm Password
              </Typography>
              <TextField
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                variant="outlined"
                fullWidth
                size="small"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          sx={{ color: "text.secondary" }}
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ py: 0.5, px: 1.5, fontSize: "0.775rem", borderRadius: "6px" }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ py: 0.5, px: 1.5, fontSize: "0.775rem", borderRadius: "6px" }}>
                {success}
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
              {loading ? "Registering..." : "Create Account"}
            </Button>
          </Box>

          <Box mt={3} pt={2} sx={{ borderTop: "1px solid #f1f5f9", textAlign: "left" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.775rem" }}>
              Already have an account?{" "}
              <Link component={RouterLink} to="/" underline="hover" sx={{ fontWeight: 600, color: "#2563eb" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;