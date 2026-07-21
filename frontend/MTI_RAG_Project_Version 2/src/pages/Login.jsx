import { Box, Container, Paper, Typography, TextField, Checkbox, FormControlLabel, Button, Link } from "@mui/material";

function Login() {
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
          elevation={5}
          sx={{
            padding: 5,
            borderRadius: 3,
          }}
        > <TextField
      label="Email Address"
      type="email"
    
      variant="outlined"
      fullWidth
      margin="normal"
    />
          <TextField
      label="Password"
      type="password"
      variant="outlined"
      fullWidth
      margin="normal"
    />
          <FormControlLabel
      control={<Checkbox />}
      label="Remember Me"
    />
          <Button
      variant="contained"
      fullWidth
      size="large"
      sx={{
          mt: 2,
          py: 1.5,
          borderRadius: 2
      }}
    >
      Login
    </Button>
          <Box mt={3} textAlign="center">
            <Typography>
              Don't have an account? {" "}
              <Link href="/register">Register</Link>
            </Typography>
          </Box>
          <Box textAlign="center" mb={4}>
            <img src="/mti-logo.png" alt="MTI Logo" width="90" />

            <Typography variant="h4" fontWeight="bold" mt={2}>
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