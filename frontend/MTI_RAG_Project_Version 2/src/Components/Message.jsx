import { useState, useEffect, useRef } from "react";
import { Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogContent, IconButton, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import imdLogo from "../assets/imd_logo.png";
import { exportMessageToPdf } from "../utils/exportPdf";
import { translateMessage } from "../services/api";

function TranslateIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 8 6 6"></path>
      <path d="m4 14 6-6 2-3"></path>
      <path d="M2 5h12"></path>
      <path d="M7 2v3"></path>
      <path d="M22 22l-5-10-5 10"></path>
      <path d="M14 18h6"></path>
    </svg>
  );
}

function VerifiedBadgeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  );
}

function SpeakerMuteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M12 18v-6"></path>
      <path d="m9 15 3 3 3-3"></path>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
  );
}

const EDIT_MODES = [
  { id: "basic", label: "🌱 Basic" },
  { id: "moderate", label: "⚖️ Moderate" },
  { id: "research", label: "🔬 In-Depth" },
];

function TypingDots() {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", py: 0.75, px: 0.5 }}>
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: "#64748b",
          animation: "typingPulse 1.4s infinite ease-in-out both",
          animationDelay: "0s",
        }}
      />
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: "#64748b",
          animation: "typingPulse 1.4s infinite ease-in-out both",
          animationDelay: "0.2s",
        }}
      />
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: "#64748b",
          animation: "typingPulse 1.4s infinite ease-in-out both",
          animationDelay: "0.4s",
        }}
      />
    </Box>
  );
}

const cleanTextDisplay = (raw) => {
  if (!raw) return "";
  return raw
    .replace(/[\uE000-\uF8FF\uFFF0-\uFFFF]/g, "")
    .replace(/\[?\s*(?:source|Source)\s*\[?\s*\d+\s*\]?\s*\]?|\(\s*(?:source|Source)\s*\d+\s*\)|\[\d+\]/gi, "")
    .replace(/ +/g, " ")
    .replace(/ \./g, ".")
    .replace(/ ,/g, ",")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const normalizeMathAndMarkdown = (raw) => {
  if (!raw) return "";
  let text = cleanTextDisplay(raw);

  // Fix bolded headers like **### 1. Overview** or ### **1. Overview**
  text = text.replace(/\*\*(#{1,4}\s+[^*]+?)\*\*/g, "\n\n$1\n\n");
  text = text.replace(/(#{1,4})\s*\*\*([^*]+?)\*\*/g, "\n\n$1 $2\n\n");

  // Ensure double newlines after every markdown heading so text doesn't merge
  text = text.replace(/^(#{1,4}\s+[^\n]+)\s*\n(?!\n)/gm, "$1\n\n");

  // Normalize LaTeX block delimiters \[ ... \] to $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, eq) => `\n\n$$\n${eq.trim()}\n$$\n\n`);

  // Normalize LaTeX inline delimiters \( ... \) to $ ... $
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (match, eq) => `$${eq.trim()}$`);

  // Strip \boxed{...} to standard equation inside math blocks
  text = text.replace(/\\boxed\{([\s\S]*?)\}/g, "$1");

  return text.trim();
};

function FormattedMarkdown({ text, isUser = false }) {
  if (!text) return null;

  const normalized = normalizeMathAndMarkdown(text);

  return (
    <Box
      sx={{
        width: "100%",
        textAlign: "left",
        color: isUser ? "#ffffff" : "text.primary",
        fontSize: "0.9125rem",
        lineHeight: 1.75,
        letterSpacing: "0.005em",
        "& .katex-display": {
          my: 1.75,
          py: 1.25,
          px: 1.5,
          borderRadius: "8px",
          bgcolor: isUser ? "rgba(255,255,255,0.12)" : "#f8fafc",
          border: isUser ? "1px solid rgba(255,255,255,0.2)" : "1px solid #e2e8f0",
          overflowX: "auto",
          overflowY: "hidden",
        },
        "& .katex": {
          fontSize: "1.05em",
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => (
            <Typography variant="h5" sx={{ fontWeight: 800, color: isUser ? "#ffffff" : "#0f172a", mt: 2.5, mb: 1, pb: 0.5, borderBottom: isUser ? "none" : "1.5px solid #e2e8f0", fontSize: "1.15rem", letterSpacing: "0.01em" }} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <Typography variant="h6" sx={{ fontWeight: 750, color: isUser ? "#ffffff" : "#1e293b", mt: 2.25, mb: 1, pb: 0.4, borderBottom: isUser ? "none" : "1px solid #f1f5f9", fontSize: "1.05rem" }} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isUser ? "#ffffff" : "#1e293b", mt: 1.75, mb: 0.75, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 0.5 }} {...props} />
          ),
          h4: ({ node, ...props }) => (
            <Typography variant="subtitle2" sx={{ fontWeight: 650, color: isUser ? "#ffffff" : "#334155", mt: 1.5, mb: 0.5, fontSize: "0.9125rem" }} {...props} />
          ),
          p: ({ node, ...props }) => (
            <Typography variant="body2" sx={{ color: isUser ? "#ffffff" : "text.primary", my: 0.65, lineHeight: 1.75, fontSize: "0.9rem" }} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <Box component="ul" sx={{ pl: 2.5, my: 0.75, listStyleType: "disc" }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <Box component="ol" sx={{ pl: 2.5, my: 0.75 }} {...props} />
          ),
          li: ({ node, ...props }) => (
            <Typography component="li" variant="body2" sx={{ my: 0.35, lineHeight: 1.72, fontSize: "0.9rem", color: isUser ? "#ffffff" : "text.primary" }} {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <Box sx={{ pl: 2, py: 0.75, my: 1.5, borderLeft: "3.5px solid", borderColor: isUser ? "#ffffff" : "#2563eb", bgcolor: isUser ? "rgba(255,255,255,0.1)" : "rgba(37, 99, 235, 0.05)", borderRadius: "0 6px 6px 0", fontStyle: "italic" }} {...props} />
          ),
          hr: ({ node, ...props }) => (
            <Box sx={{ my: 2, border: 0, borderTop: isUser ? "1px solid rgba(255,255,255,0.25)" : "1px solid #e2e8f0" }} />
          ),
          table: ({ node, ...props }) => (
            <Box sx={{ overflowX: "auto", my: 2, borderRadius: "8px", border: isUser ? "1px solid rgba(255,255,255,0.3)" : "1px solid #e2e8f0", boxShadow: isUser ? "none" : "0 1px 3px 0 rgba(0,0,0,0.04)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }} {...props} />
            </Box>
          ),
          thead: ({ node, ...props }) => (
            <thead style={{ backgroundColor: isUser ? "rgba(255,255,255,0.15)" : "#f8fafc", borderBottom: isUser ? "2px solid rgba(255,255,255,0.3)" : "2px solid #cbd5e1" }} {...props} />
          ),
          th: ({ node, ...props }) => (
            <th style={{ padding: "10px 14px", fontWeight: 700, color: isUser ? "#ffffff" : "#1e293b", borderRight: isUser ? "1px solid rgba(255,255,255,0.15)" : "1px solid #e2e8f0" }} {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr style={{ borderBottom: isUser ? "1px solid rgba(255,255,255,0.1)" : "1px solid #f1f5f9" }} {...props} />
          ),
          td: ({ node, ...props }) => (
            <td style={{ padding: "9px 14px", verticalAlign: "top", color: isUser ? "#ffffff" : "inherit", borderRight: isUser ? "1px solid rgba(255,255,255,0.1)" : "1px solid #f8fafc" }} {...props} />
          ),
          code: ({ node, inline, ...props }) => {
            if (inline) {
              return (
                <Box
                  component="code"
                  sx={{
                    fontFamily: "Consolas, Monaco, monospace",
                    fontSize: "0.825rem",
                    px: 0.75,
                    py: 0.2,
                    mx: 0.2,
                    borderRadius: "4px",
                    bgcolor: isUser ? "rgba(255, 255, 255, 0.2)" : "rgba(37, 99, 235, 0.08)",
                    color: isUser ? "#ffffff" : "#1d4ed8",
                    border: "1px solid",
                    borderColor: isUser ? "rgba(255, 255, 255, 0.3)" : "rgba(37, 99, 235, 0.2)",
                  }}
                  {...props}
                />
              );
            }
            return (
              <Box
                component="pre"
                sx={{
                  my: 1.5,
                  p: 1.75,
                  borderRadius: "8px",
                  bgcolor: "#0f172a",
                  color: "#f8fafc",
                  fontFamily: "Consolas, Monaco, monospace",
                  fontSize: "0.8375rem",
                  lineHeight: 1.55,
                  overflowX: "auto",
                  border: "1px solid #334155",
                }}
              >
                <code {...props} />
              </Box>
            );
          },
        }}
      >
        {normalized}
      </ReactMarkdown>
    </Box>
  );
}

function PaletteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.71 1.7-1.63 0-.44-.18-.85-.46-1.16-.27-.3-.43-.72-.43-1.18 0-.92.75-1.67 1.67-1.67H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"></path>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

function Message({ role, text, references = [], images = [], timestamp, isLoading = false, onEdit, onDelete, messageId, historyId, userQuestion = "" }) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || "");
  const [editMode, setEditMode] = useState("moderate");
  const [translatedHindiText, setTranslatedHindiText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showHindi, setShowHindi] = useState(false);
  const editInputRef = useRef(null);
  const displayText = isUser ? text : cleanTextDisplay(showHindi && translatedHindiText ? translatedHindiText : text);

  const handleToggleHindiTranslation = async () => {
    if (showHindi) {
      setShowHindi(false);
      return;
    }

    if (translatedHindiText) {
      setShowHindi(true);
      return;
    }

    setIsTranslating(true);
    try {
      let hindi = null;

      // 1. Try Groq LLM backend translation
      try {
        const res = await translateMessage(text, "hindi");
        if (res && res.translated_text && /[\u0900-\u097F]/.test(res.translated_text)) {
          hindi = res.translated_text;
        }
      } catch (e) {
        console.warn("Backend translation fallback triggered:", e);
      }

      // 2. Fallback to client-side Google Translate API if Groq key is unconfigured
      if (!hindi) {
        hindi = await translateToHindiClient(text);
      }

      if (hindi) {
        setTranslatedHindiText(hindi);
        setShowHindi(true);
      } else {
        alert("Unable to translate text to Hindi right now.");
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditText(text || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditText(text || "");
    setIsEditing(false);
  };

  const handleSubmitEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed || !onEdit) return;
    onEdit(messageId, trimmed, editMode);
    setIsEditing(false);
  };

  useEffect(() => {
    return () => {
      if (isSpeaking && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const handleCopy = () => {
    if (displayText) {
      navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleSpeech = () => {
    if (!("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanSpeech = displayText
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/[`#*_]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (showHindi) {
      selectedVoice = voices.find((v) => v.lang.startsWith("hi") || v.name.includes("Hindi"));
    }

    if (!selectedVoice) {
      selectedVoice =
        voices.find(
          (v) =>
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Samantha") ||
              v.name.includes("Microsoft")) &&
            v.lang.startsWith("en")
        ) || voices.find((v) => v.lang.startsWith("en"));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const isHindiActive = showHindi && !!translatedHindiText;
      let finalQuestion = userQuestion;

      if (isHindiActive && userQuestion) {
        try {
          const res = await translateMessage(userQuestion, "hindi");
          if (res && res.translated_text) {
            finalQuestion = `${res.translated_text}\n\n(${userQuestion})`;
          }
        } catch (e) {
          console.warn("Question translation for PDF export:", e);
        }
      }

      await exportMessageToPdf({
        question: finalQuestion,
        text: isHindiActive ? translatedHindiText : text,
        timestamp,
        references,
        isHindi: isHindiActive,
      });
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: { xs: 0.75, sm: 1.25 }, justifyContent: isUser ? "flex-end" : "flex-start", my: 0.75, textAlign: "left" }}>
      {!isUser && (
        <Avatar
          src={imdLogo}
          alt="MTI Knowledge System"
          sx={{
            width: { xs: 32, sm: 38 },
            height: { xs: 32, sm: 38 },
            mt: 0.25,
            flexShrink: 0,
            bgcolor: "transparent",
            p: 0,
            "& img": {
              objectFit: "contain",
              width: "100%",
              height: "100%",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
            },
          }}
        />
      )}

      <Paper
        elevation={0}
        sx={{
          maxWidth: { xs: "93%", sm: "85%", md: "78%" },
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.25, sm: 1.5 },
          borderRadius: { xs: "10px", sm: "12px" },
          bgcolor: isUser ? "#2563eb" : "background.paper",
          color: isUser ? "#ffffff" : "text.primary",
          border: isUser ? "none" : "1px solid",
          borderColor: isUser ? "transparent" : "divider",
          boxShadow: isUser ? "none" : "0 1px 3px 0 rgba(15, 23, 42, 0.04)",
          position: "relative",
          textAlign: "left",
          overflowWrap: "anywhere",
        }}
      >
        {!isUser && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 0.75,
              mb: 0.75,
              pb: 0.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap" }}>
              <Typography variant="caption" sx={{ fontWeight: 650, fontSize: { xs: "0.7rem", sm: "0.725rem" }, color: "text.primary" }}>
                MTI Assistant
              </Typography>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, px: 0.6, py: 0.1, borderRadius: "4px", bgcolor: "rgba(37, 99, 235, 0.08)", color: "#1d4ed8", fontSize: "0.625rem", fontWeight: 600 }}>
                <VerifiedBadgeIcon />
                Official Context
              </Box>
            </Box>

            {!isLoading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.25, sm: 0.4 }, flexWrap: "wrap" }}>
                <Tooltip title={isTranslating ? "Translating to Hindi..." : showHindi ? "Switch to English" : "Translate response to Hindi (हिंदी)"} placement="top">
                  <Button
                    size="small"
                    onClick={handleToggleHindiTranslation}
                    disabled={isTranslating}
                    startIcon={isTranslating ? <CircularProgress size={11} color="inherit" /> : <TranslateIcon />}
                    sx={{
                      py: 0.1,
                      px: 0.65,
                      fontSize: "0.675rem",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "4px",
                      color: showHindi ? "#047857" : "#2563eb",
                      bgcolor: showHindi ? "rgba(16, 185, 129, 0.1)" : "rgba(37, 99, 235, 0.08)",
                      "&:hover": {
                        bgcolor: showHindi ? "rgba(16, 185, 129, 0.18)" : "rgba(37, 99, 235, 0.15)",
                      },
                    }}
                  >
                    {isTranslating ? "Translating..." : showHindi ? "English" : "हिंदी"}
                  </Button>
                </Tooltip>

                {("speechSynthesis" in window) && text && (
                  <Tooltip title={isSpeaking ? "Stop reading" : "Read response aloud"} placement="top">
                    <IconButton
                      size="small"
                      onClick={handleToggleSpeech}
                      sx={{
                        opacity: isSpeaking ? 1 : 0.65,
                        p: { xs: 0.35, sm: 0.4 },
                        color: isSpeaking ? "#2563eb" : "text.secondary",
                        bgcolor: isSpeaking ? "rgba(37, 99, 235, 0.1)" : "transparent",
                        "&:hover": { opacity: 1, bgcolor: "#f1f5f9" },
                      }}
                    >
                      {isSpeaking ? <SpeakerMuteIcon /> : <SpeakerIcon />}
                    </IconButton>
                  </Tooltip>
                )}

                {text && (
                  <>
                    <Tooltip title={copied ? "Copied!" : "Copy response"} placement="top">
                      <IconButton
                        size="small"
                        onClick={handleCopy}
                        sx={{
                          opacity: 0.65,
                          p: { xs: 0.35, sm: 0.4 },
                          color: "text.secondary",
                          "&:hover": { opacity: 1, bgcolor: "#f1f5f9" },
                        }}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={isDownloadingPdf ? "Generating High-Resolution PDF..." : "Download as PDF"} placement="top">
                      <span>
                        <IconButton
                          size="small"
                          disabled={isDownloadingPdf}
                          onClick={handleDownloadPdf}
                          sx={{
                            opacity: isDownloadingPdf ? 0.4 : 0.65,
                            p: { xs: 0.35, sm: 0.4 },
                            color: "text.secondary",
                            "&:hover": { opacity: 1, bgcolor: "#f1f5f9" },
                          }}
                        >
                          <PdfIcon />
                        </IconButton>
                      </span>
                    </Tooltip>



                    {onDelete && (
                      <Tooltip title="Delete question & response" placement="top">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(historyId, messageId)}
                          sx={{
                            opacity: 0.65,
                            p: { xs: 0.35, sm: 0.4 },
                            color: "text.secondary",
                            "&:hover": { opacity: 1, color: "#ef4444", bgcolor: "#fef2f2" },
                          }}
                        >
                          <TrashIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}
              </Box>
            )}
          </Box>
        )}

        {isUser && isEditing ? (
          <Box sx={{ width: "100%" }}>
            <TextField
              fullWidth
              multiline
              maxRows={6}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              inputRef={editInputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitEdit();
                }
                if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
              size="small"
              sx={{
                mb: 1.25,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "0.8375rem",
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.35)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.55)" },
                  "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                },
                "& .MuiInputBase-input": { color: "#ffffff" },
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between", flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.675rem", fontWeight: 600 }}>
                  Depth:
                </Typography>
                <Select
                  value={editMode}
                  onChange={(e) => setEditMode(e.target.value)}
                  size="small"
                  sx={{
                    height: 28,
                    fontSize: "0.725rem",
                    color: "#ffffff",
                    borderRadius: "6px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.55)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.7)" },
                    "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.7)" },
                  }}
                >
                  {EDIT_MODES.map((m) => (
                    <MenuItem key={m.id} value={m.id} sx={{ fontSize: "0.775rem" }}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box sx={{ display: "flex", gap: 0.75 }}>
                <Button
                  size="small"
                  onClick={handleCancelEdit}
                  sx={{
                    fontSize: "0.725rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.8)",
                    textTransform: "none",
                    borderRadius: "6px",
                    px: 1.25,
                    minWidth: 0,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSubmitEdit}
                  disabled={!editText.trim()}
                  sx={{
                    fontSize: "0.725rem",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "6px",
                    px: 1.25,
                    minWidth: 0,
                    bgcolor: "#ffffff",
                    color: "#2563eb",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#f1f5f9", boxShadow: "none" },
                    "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.3)", color: "rgba(37,99,235,0.5)" },
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
            {isLoading ? (
              <TypingDots />
            ) : (
              <FormattedMarkdown text={displayText} isUser={isUser} />
            )}

            {isUser && text && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
                {onEdit && (
                  <Tooltip title="Edit query" placement="top">
                    <IconButton
                      size="small"
                      onClick={handleStartEdit}
                      sx={{
                        opacity: 0.7,
                        p: 0.25,
                        color: "#ffffff",
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={copied ? "Copied!" : "Copy text"} placement="top">
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    sx={{
                      opacity: 0.7,
                      p: 0.25,
                      color: "#ffffff",
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>

                {onDelete && (
                  <Tooltip title="Delete question" placement="top">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(historyId, messageId)}
                      sx={{
                        opacity: 0.7,
                        p: 0.25,
                        color: "#ffffff",
                        "&:hover": { opacity: 1, color: "#fca5a5" },
                      }}
                    >
                      <TrashIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
        )}




        {!isUser && references.length > 0 && (
          <Box sx={{ mt: 1.5, pt: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.7rem", display: "block", mb: 0.75 }}>
              Document References:
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.75 }}>
              {references.map((ref, idx) => (
                <Chip
                  key={idx}
                  icon={<DocumentIcon />}
                  size="small"
                  label={ref}
                  variant="outlined"
                  sx={{
                    borderRadius: "5px",
                    fontSize: "0.7rem",
                    height: 22,
                    borderColor: "divider",
                    bgcolor: "action.hover",
                    color: "text.secondary",
                    "& .MuiChip-icon": { color: "text.secondary", ml: 0.75 },
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {timestamp && (
          <Typography
            variant="caption"
            sx={{
              mt: 0.75,
              display: "block",
              textAlign: isUser ? "right" : "left",
              opacity: isUser ? 0.85 : 0.5,
              fontSize: "0.6875rem",
            }}
          >
            {timestamp}
          </Typography>
        )}
      </Paper>

      {isUser && (
        <Avatar
          sx={{
            bgcolor: "#64748b",
            color: "#ffffff",
            width: { xs: 28, sm: 32 },
            height: { xs: 28, sm: 32 },
            mt: 0.25,
            flexShrink: 0,
          }}
        >
          <UserIcon />
        </Avatar>
      )}
    </Box>
  );
}

export default Message;
