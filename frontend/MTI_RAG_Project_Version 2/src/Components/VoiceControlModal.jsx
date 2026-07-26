import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

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

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

const COMMAND_GROUPS = [
  {
    category: "💬 Conversation Control",
    commands: [
      { trigger: '"New conversation" / "Start new chat"', desc: "Initializes a fresh chat thread" },
      { trigger: '"Download conversation" / "Export PDF"', desc: "Downloads conversation as PDF" },
      { trigger: '"Delete last message" / "Remove question"', desc: "Deletes the latest question & answer pair" },
    ],
  },
  {
    category: "🎨 AI Diagram & Visuals",
    commands: [
      { trigger: '"Generate diagram" / "Draw diagram"', desc: "Auto-generates an AI meteorological chart" },
      { trigger: '"Toggle emojis" / "Enable emojis"', desc: "Toggles AI response emoji preference" },
    ],
  },
  {
    category: "⚙️ Navigation & Settings",
    commands: [
      { trigger: '"Open settings" / "Show preferences"', desc: "Opens Personalization & Settings modal" },
      { trigger: '"Open history" / "Show history"', desc: "Opens Thread History drawer" },
      { trigger: '"Voice help" / "Show commands"', desc: "Opens this Voice Command Center" },
    ],
  },
  {
    category: "🚀 Response Depth & Mode",
    commands: [
      { trigger: '"Basic mode" / "Set mode to basic"', desc: "Switches to Simple Educational mode" },
      { trigger: '"Moderate mode" / "Standard mode"', desc: "Switches to Balanced Trainee mode" },
      { trigger: '"Research mode" / "In-depth mode"', desc: "Switches to Technical Research mode" },
    ],
  },
  {
    category: "🌓 Interface & Page Navigation",
    commands: [
      { trigger: '"Toggle dark mode" / "Light mode"', desc: "Switches light and dark theme" },
      { trigger: '"Scroll to top" / "Scroll to bottom"', desc: "Navigates message list position" },
      { trigger: '"Logout" / "Sign out"', desc: "Logs out of your account" },
    ],
  },
];

function VoiceControlModal({ open, onClose, onExecuteCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastExecuted, setLastExecuted] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    if (open && speechSupported) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [open, speechSupported]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignored
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        if (currentText && onExecuteCommand) {
          const executed = onExecuteCommand(currentText);
          if (executed) {
            setLastExecuted(currentText);
            setTranscript("");
            setTimeout(() => {
              onClose();
            }, 800);
          }
        }
      };

      recognition.onerror = (err) => {
        if (err.error === "not-allowed" || err.error === "service-not-allowed") {
          setIsListening(false);
          try {
            recognition.stop();
          } catch {
            // Ignored
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start voice control recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 0.5,
          textAlign: "left",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: isListening ? "rgba(239, 68, 68, 0.15)" : "rgba(37, 99, 235, 0.15)",
              color: isListening ? "#ef4444" : "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MicIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.2 }}>
              Voice Assistant Command Center
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.725rem" }}>
              Speak any app command to execute features hands-free
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2.5, px: 3, maxHeight: "75vh", overflowY: "auto" }}>
        {/* Live Listening Banner */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: "12px",
            bgcolor: isListening ? "rgba(239, 68, 68, 0.06)" : "action.hover",
            border: "1px solid",
            borderColor: isListening ? "rgba(239, 68, 68, 0.3)" : "divider",
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
            <Chip
              label={isListening ? "🎙️ LISTENING FOR APP COMMANDS" : "🎙️ PAUSED"}
              size="small"
              color={isListening ? "error" : "default"}
              sx={{
                fontWeight: 750,
                fontSize: "0.7rem",
                letterSpacing: "0.03em",
                animation: isListening ? "pulse 1.5s infinite" : "none",
                "@keyframes pulse": {
                  "0%": { opacity: 1 },
                  "50%": { opacity: 0.5 },
                  "100%": { opacity: 1 },
                },
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem", minHeight: 24, color: "text.primary" }}>
            {transcript ? `"${transcript}"` : isListening ? "Listening... Speak a command below..." : "Click Start to enable voice control"}
          </Typography>

          {lastExecuted && (
            <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: 700, display: "block", mt: 0.5 }}>
              ✓ Executed: "{lastExecuted}"
            </Typography>
          )}

          <Box sx={{ mt: 1.5, display: "flex", justifyContent: "center" }}>
            <Button
              variant={isListening ? "contained" : "outlined"}
              color={isListening ? "error" : "primary"}
              size="small"
              onClick={toggleListening}
              startIcon={isListening ? <MicOffIcon /> : <MicIcon />}
              sx={{ borderRadius: "20px", textTransform: "none", fontWeight: 650, px: 2.5 }}
            >
              {isListening ? "Pause Listening" : "Start Listening"}
            </Button>
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary", mb: 1.5 }}>
          Available Voice Commands & Controls:
        </Typography>

        <Stack spacing={2}>
          {COMMAND_GROUPS.map((group, idx) => (
            <Box key={idx} sx={{ p: 1.5, borderRadius: "10px", bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
              <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 700, fontSize: "0.75rem", display: "block", mb: 1 }}>
                {group.category}
              </Typography>
              <Stack spacing={0.75}>
                {group.commands.map((cmd, cIdx) => (
                  <Box key={cIdx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary" }}>
                      {cmd.trigger}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.725rem", textAlign: "right" }}>
                      {cmd.desc}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
        <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: "8px", fontWeight: 600, px: 2.5 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VoiceControlModal;
