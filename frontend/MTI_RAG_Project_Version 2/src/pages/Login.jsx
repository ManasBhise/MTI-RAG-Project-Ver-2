import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { loginUser, saveSession } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ email: email.trim(), password });
      saveSession(response, rememberMe);
      navigate("/chat", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.detail || "Login failed. Please verify your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={5}
          sx={{
            padding: 5,
            borderRadius: 3,
          }}
        >
          <TextField
            label="Email Address"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <FormControlLabel
            control={<Checkbox checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />}
            label="Remember Me"
          />

          {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Box mt={3} sx={{ textAlign: "center" }}>
            <Typography>
              Don&apos;t have an account? <Link component={RouterLink} to="/register">Register</Link>
            </Typography>
          </Box>

          <Box mb={4} sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                boxShadow: "0 8px 24px rgba(25, 118, 210, 0.25)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </Box>

            <Typography variant="h4" fontWeight="bold" mt={1}>
              MTI Knowledge Assistant
            </Typography>

            <Typography color="text.secondary" mt={1}>
              Meteorological Training Institute
            </Typography>

            <Typography color="text.secondary" mt={1}>
              Sign in to access the knowledge base
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;