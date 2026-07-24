import { Component } from "react";
import { Alert, Box, Button, Paper, Typography } from "@mui/material";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f8fafc",
            p: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: 480,
              width: "100%",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              textAlign: "left",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a", mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: "0.8375rem" }}>
              An unexpected display error occurred while rendering the page.
            </Typography>

            {this.state.error && (
              <Alert severity="error" sx={{ mb: 3, fontSize: "0.775rem" }}>
                {this.state.error.message || String(this.state.error)}
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={this.handleReload}
              sx={{
                bgcolor: "#2563eb",
                fontWeight: 600,
                fontSize: "0.8125rem",
                borderRadius: "8px",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
