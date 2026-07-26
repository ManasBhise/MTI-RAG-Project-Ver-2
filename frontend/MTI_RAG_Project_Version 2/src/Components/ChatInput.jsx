import { useEffect, useRef, useState } from "react";
import { Box, Button, Chip, CircularProgress, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 10M5 10a7 7 0 0 0 12 5.29M9 9v1a3 3 0 0 0 5.12 2.12" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
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
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setValue(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start voice recognition:", err);
      setIsListening(false);
    }
  };

  const handleSend = () => {
    const message = value.trim();
    if (!message || disabled) {
      return;
    }
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
      setIsListening(false);
    }
    onSend(message);
    setValue("");
  };

  return (
    <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper", textAlign: "left" }}>
      {/* Response Depth Mode Selector & Voice Input Indicator */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
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

        {isListening && (
          <Chip
            label="🎙️ Listening... Speak now"
            size="small"
            color="error"
            variant="outlined"
            onClick={toggleListening}
            sx={{
              height: 22,
              fontSize: "0.6875rem",
              fontWeight: 700,
              animation: "pulse 1.5s infinite",
              "@keyframes pulse": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.5 },
                "100%": { opacity: 1 },
              },
            }}
          />
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end", maxWidth: "100%" }}>
        <TextField
          fullWidth
          placeholder={isListening ? "Listening to your voice... Speak your question..." : "Ask a question about MTI training material or speak your query..."}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          multiline
          minRows={4}
          maxRows={16}
          disabled={disabled}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              p: 2,
              bgcolor: isListening ? "rgba(239, 68, 68, 0.04)" : "background.default",
              color: "text.primary",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              "& fieldset": {
                borderColor: isListening ? "#ef4444" : "#cbd5e1",
              },
              "&:hover fieldset": {
                borderColor: isListening ? "#ef4444" : "#94a3b8",
              },
              "&.Mui-focused fieldset": {
                borderColor: isListening ? "#ef4444" : "#2563eb",
                borderWidth: "1.5px",
              },
            },
          }}
        />

        {/* Voice Input Mic Button */}
        <Tooltip title={isListening ? "Stop voice listening" : speechSupported ? "Start voice query dictation" : "Voice input not supported in this browser"} placement="top">
          <span>
            <IconButton
              onClick={toggleListening}
              disabled={disabled || !speechSupported}
              sx={{
                width: 52,
                height: 52,
                borderRadius: "14px",
                border: "1px solid",
                borderColor: isListening ? "#ef4444" : "rgba(37, 99, 235, 0.2)",
                bgcolor: isListening ? "#ef4444" : "rgba(37, 99, 235, 0.06)",
                color: isListening ? "#ffffff" : "#2563eb",
                boxShadow: isListening ? "0 4px 14px rgba(239, 68, 68, 0.4)" : "0 2px 6px rgba(0, 0, 0, 0.03)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-1.5px)",
                  bgcolor: isListening ? "#dc2626" : "rgba(37, 99, 235, 0.12)",
                  boxShadow: isListening ? "0 6px 18px rgba(239, 68, 68, 0.5)" : "0 4px 12px rgba(37, 99, 235, 0.18)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              {isListening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </span>
        </Tooltip>

        <Button
          variant="contained"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          sx={{
            minWidth: 110,
            height: 52,
            borderRadius: "14px",
            fontSize: "0.9125rem",
            fontWeight: 650,
            letterSpacing: "0.01em",
            textTransform: "none",
            background: disabled || !value.trim() ? "action.disabledBackground" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            boxShadow: disabled || !value.trim() ? "none" : "0 4px 14px rgba(37, 99, 235, 0.35)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              boxShadow: "0 6px 20px rgba(37, 99, 235, 0.45)",
              transform: "translateY(-1.5px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
          endIcon={disabled ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
        >
          {disabled ? "Sending" : "Send"}
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block", textAlign: "left", fontSize: "0.7rem" }}>
        Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line • Click 🎙️ for <strong>Voice Input</strong>
      </Typography>
    </Box>
  );
}

export default ChatInput;
