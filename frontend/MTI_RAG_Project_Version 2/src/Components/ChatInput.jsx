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
  { id: "basic", label: "🌱 Basic", fullLabel: "🌱 Basic Language", hint: "Simple terms & analogies" },
  { id: "moderate", label: "⚖️ Moderate", fullLabel: "⚖️ Moderate Level", hint: "Balanced educational response" },
  { id: "research", label: "🔬 Research", fullLabel: "🔬 In-Depth Research", hint: "Technical equations, NWP & deep domain analysis" },
];

function ChatInput({ onSend, disabled = false, mode = "moderate", onModeChange, onVoiceCommand }) {
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
          if (onVoiceCommand && onVoiceCommand(transcript)) {
            setValue("");
            try {
              recognition.stop();
            } catch {
              // Ignored
            }
            setIsListening(false);
          }
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
    <Box
      sx={{
        px: { xs: 1.25, sm: 2 },
        pt: { xs: 1, sm: 1.5 },
        pb: { xs: "calc(8px + env(safe-area-inset-bottom, 0px))", sm: 1.5 },
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        textAlign: "left",
      }}
    >
      {/* Response Depth Mode Selector & Voice Input Indicator */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          gap: 1,
        }}
      >
        <Box
          className="no-scrollbar"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            overflowX: "auto",
            whiteSpace: "nowrap",
            flex: 1,
            py: 0.25,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 650,
              fontSize: "0.685rem",
              color: "text.secondary",
              flexShrink: 0,
              display: { xs: "none", sm: "inline" },
            }}
          >
            Depth:
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
            {MODES.map((item) => {
              const isSelected = mode === item.id;
              return (
                <Tooltip key={item.id} title={item.hint} placement="top">
                  <Chip
                    label={
                      <Box component="span">
                        <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                          {item.label}
                        </Box>
                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                          {item.fullLabel}
                        </Box>
                      </Box>
                    }
                    size="small"
                    onClick={() => onModeChange && onModeChange(item.id)}
                    sx={{
                      fontSize: { xs: "0.685rem", sm: "0.725rem" },
                      height: { xs: 22, sm: 24 },
                      cursor: "pointer",
                      fontWeight: isSelected ? 650 : 450,
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
            label="🎙️ Listening..."
            size="small"
            color="error"
            variant="outlined"
            onClick={toggleListening}
            sx={{
              height: 22,
              fontSize: "0.675rem",
              fontWeight: 700,
              flexShrink: 0,
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

      {/* Main Input Row */}
      <Box sx={{ display: "flex", gap: { xs: 0.75, sm: 1.25 }, alignItems: "flex-end", maxWidth: "100%" }}>
        <TextField
          fullWidth
          placeholder={isListening ? "Listening... Speak your query..." : "Ask a question about MTI meteorological materials..."}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          multiline
          minRows={2}
          maxRows={6}
          disabled={disabled}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: { xs: "12px", sm: "14px" },
              fontSize: { xs: "0.875rem", sm: "0.925rem" },
              lineHeight: 1.5,
              p: { xs: 1.25, sm: 1.75 },
              bgcolor: isListening ? "rgba(239, 68, 68, 0.04)" : "background.default",
              color: "text.primary",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
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
                width: { xs: 44, sm: 48 },
                height: { xs: 44, sm: 48 },
                borderRadius: { xs: "12px", sm: "14px" },
                border: "1px solid",
                borderColor: isListening ? "#ef4444" : "rgba(37, 99, 235, 0.2)",
                bgcolor: isListening ? "#ef4444" : "rgba(37, 99, 235, 0.06)",
                color: isListening ? "#ffffff" : "#2563eb",
                flexShrink: 0,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-1px)",
                  bgcolor: isListening ? "#dc2626" : "rgba(37, 99, 235, 0.12)",
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

        {/* Send Button */}
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          sx={{
            minWidth: { xs: 44, sm: 92 },
            width: { xs: 44, sm: "auto" },
            height: { xs: 44, sm: 48 },
            px: { xs: 0, sm: 2 },
            borderRadius: { xs: "12px", sm: "14px" },
            fontSize: "0.875rem",
            fontWeight: 650,
            textTransform: "none",
            flexShrink: 0,
            background: disabled || !value.trim() ? "action.disabledBackground" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            boxShadow: disabled || !value.trim() ? "none" : "0 3px 10px rgba(37, 99, 235, 0.3)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "& .MuiButton-endIcon": {
              m: { xs: 0, sm: "0 0 0 6px" },
            },
            "&:hover": {
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
          endIcon={disabled ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            {disabled ? "Sending" : "Send"}
          </Box>
        </Button>
      </Box>

      {/* Footer Info / Disclaimer */}
      <Box
        sx={{
          mt: 0.75,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 0.35,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.685rem", opacity: 0.85, display: { xs: "none", sm: "block" } }}>
          Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line • 🎙️ for <strong>Voice Input</strong>
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: "0.675rem",
            opacity: 0.85,
            textAlign: { xs: "left", md: "right" },
            lineHeight: 1.35,
          }}
        >
          <strong style={{ color: "#d97706" }}>Disclaimer:</strong> AI answers may contain inaccuracies. Verify critical data with official IMD manuals.
        </Typography>
      </Box>
    </Box>
  );
}

export default ChatInput;
