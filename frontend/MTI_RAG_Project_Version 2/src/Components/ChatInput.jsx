import { useState } from "react";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

function ChatInput({ onSend, disabled = false }) {
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
    <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <TextField
          fullWidth
          placeholder="Ask a question about MTI training material..."
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
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          sx={{ minWidth: 100, height: 48, borderRadius: 2.5 }}
          endIcon={disabled ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
        >
          {disabled ? "Thinking" : "Send"}
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block", textAlign: "center", fontSize: "0.75rem" }}>
        Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line.
      </Typography>
    </Box>
  );
}

export default ChatInput;

