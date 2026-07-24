import { useState } from "react";
import { Box, Button, Chip, CircularProgress, Stack, TextField, Tooltip, Typography } from "@mui/material";

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

const MODES = [
  { id: "basic", label: "🌱 Basic Language", hint: "Simple terms & analogies" },
  { id: "moderate", label: "⚖️ Moderate Level", hint: "Balanced educational response" },
  { id: "research", label: "🔬 In-Depth Research", hint: "Technical equations, NWP & deep domain analysis" },
];

function ChatInput({ onSend, disabled = false, mode = "moderate", onModeChange }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const message = value.trim();
    if (!message || disabled) {
      return;
    }
    onSend(message);
    setValue("");
  };

  return (
    <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper", textAlign: "left" }}>
      {/* Response Depth Mode Selector */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25, flexWrap: "wrap" }}>
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.7rem", color: "text.secondary" }}>
          Response Depth:
        </Typography>
        <Stack direction="row" spacing={0.75}>
          {MODES.map((item) => {
            const isSelected = mode === item.id;
            return (
              <Tooltip key={item.id} title={item.hint} placement="top">
                <Chip
                  label={item.label}
                  size="small"
                  onClick={() => onModeChange && onModeChange(item.id)}
                  sx={{
                    fontSize: "0.725rem",
                    height: 24,
                    cursor: "pointer",
                    fontWeight: isSelected ? 600 : 400,
                    bgcolor: isSelected ? "rgba(37, 99, 235, 0.15)" : "action.hover",
                    color: isSelected ? "#2563eb" : "text.secondary",
                    border: "1px solid",
                    borderColor: isSelected ? "#2563eb" : "divider",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: isSelected ? "rgba(37, 99, 235, 0.25)" : "action.selected",
                    },
                  }}
                />
              </Tooltip>
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end", maxWidth: "100%" }}>
        <TextField
          fullWidth
          placeholder="Ask a question about MTI training material or meteorological documentation..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          multiline
          maxRows={4}
          disabled={disabled}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: "0.8375rem",
              bgcolor: "background.default",
              color: "text.primary",
              "& fieldset": {
                borderColor: "#e2e8f0",
              },
              "&:hover fieldset": {
                borderColor: "#cbd5e1",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#2563eb",
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          sx={{
            minWidth: 88,
            height: 40,
            borderRadius: "8px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            bgcolor: "#2563eb",
            "&:hover": {
              bgcolor: "#1d4ed8",
            },
          }}
          endIcon={disabled ? <CircularProgress size={14} color="inherit" /> : <SendIcon />}
        >
          {disabled ? "Sending" : "Send"}
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block", textAlign: "left", fontSize: "0.7rem" }}>
        Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line
      </Typography>
    </Box>
  );
}

export default ChatInput;
