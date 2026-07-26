import { useState, useEffect, useRef } from "react";
import { Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogContent, IconButton, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import imdLogo from "../assets/imd_logo.jpg";
import { exportMessageToPdf } from "../utils/exportPdf";
import { generateDiagram } from "../services/api";

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

function FormattedMarkdown({ text, isUser = false }) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1, textAlign: "left" }}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <Box key={lineIdx} sx={{ height: 4 }} />;
        }

        const isBullet = /^(?:\*|-|•)\s+/.test(trimmed);
        const content = isBullet ? trimmed.replace(/^(?:\*|-|•)\s+/, "") : line;

        // Parse **bold** markers inside line
        const parts = content.split(/(\*\*.*?\*\*)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
            return (
              <strong key={pIdx} style={{ fontWeight: 650, color: "inherit" }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <Box key={lineIdx} sx={{ display: "flex", alignItems: "flex-start", gap: 1, pl: 0.5, my: 0.15 }}>
              <Box component="span" sx={{ color: isUser ? "#ffffff" : "#2563eb", fontWeight: "bold", fontSize: "0.75rem", lineHeight: 1.6, userSelect: "none" }}>
                •
              </Box>
              <Typography variant="body2" sx={{ fontSize: "0.8375rem", lineHeight: 1.6, color: isUser ? "#ffffff" : "text.primary", flex: 1 }}>
                {renderedLine}
              </Typography>
            </Box>
          );
        }

        return (
          <Typography key={lineIdx} variant="body2" sx={{ fontSize: "0.8375rem", lineHeight: 1.6, color: isUser ? "#ffffff" : "text.primary" }}>
            {renderedLine}
          </Typography>
        );
      })}
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

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
  const [diagrams, setDiagrams] = useState([]);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const editInputRef = useRef(null);
  const displayText = isUser ? text : cleanTextDisplay(text);

  const handleGenerateDiagram = async () => {
    const promptQuery = userQuestion.trim() || displayText.slice(0, 150);
    if (!promptQuery) return;

    setDiagramLoading(true);
    try {
      const diagram = await generateDiagram(promptQuery);
      setDiagrams((prev) => [...prev, diagram]);
    } catch (err) {
      console.error("Diagram generation failed:", err);
    } finally {
      setDiagramLoading(false);
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
    const englishVoice =
      voices.find(
        (v) =>
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Microsoft")) &&
          v.lang.startsWith("en")
      ) || voices.find((v) => v.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadPdf = () => {
    exportMessageToPdf({ question: userQuestion, text, timestamp, references });
  };

  return (
    <Box sx={{ display: "flex", gap: 1.25, justifyContent: isUser ? "flex-end" : "flex-start", my: 0.75, textAlign: "left" }}>
      {!isUser && (
        <Avatar
          src={imdLogo}
          alt="MTI Knowledge System"
          sx={{
            width: 32,
            height: 32,
            mt: 0.25,
            flexShrink: 0,
            border: "1px solid #cbd5e1",
            bgcolor: "#ffffff",
            p: "2px",
            "& img": {
              objectFit: "contain",
            },
          }}
        />
      )}

      <Paper
        elevation={0}
        sx={{
          maxWidth: { xs: "88%", md: "78%" },
          px: 2,
          py: 1.5,
          borderRadius: "10px",
          bgcolor: isUser ? "#2563eb" : "background.paper",
          color: isUser ? "#ffffff" : "text.primary",
          border: isUser ? "none" : "1px solid",
          borderColor: isUser ? "transparent" : "divider",
          boxShadow: isUser ? "none" : "0 1px 3px 0 rgba(15, 23, 42, 0.04)",
          position: "relative",
          textAlign: "left",
        }}
      >
        {!isUser && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75, pb: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.725rem", color: "text.primary" }}>
                MTI Knowledge Assistant
              </Typography>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, px: 0.75, py: 0.1, borderRadius: "4px", bgcolor: "rgba(37, 99, 235, 0.08)", color: "#1d4ed8", fontSize: "0.65rem", fontWeight: 600 }}>
                <VerifiedBadgeIcon />
                Official Context
              </Box>
            </Box>

            {!isLoading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {("speechSynthesis" in window) && text && (
                  <Tooltip title={isSpeaking ? "Stop reading" : "Read response aloud"} placement="top">
                    <IconButton
                      size="small"
                      onClick={handleToggleSpeech}
                      sx={{
                        opacity: isSpeaking ? 1 : 0.6,
                        p: 0.25,
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
                          opacity: 0.6,
                          p: 0.25,
                          color: "text.secondary",
                          "&:hover": { opacity: 1, bgcolor: "#f1f5f9" },
                        }}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Download as PDF" placement="top">
                      <IconButton
                        size="small"
                        onClick={handleDownloadPdf}
                        sx={{
                          opacity: 0.6,
                          p: 0.25,
                          color: "text.secondary",
                          "&:hover": { opacity: 1, bgcolor: "#f1f5f9" },
                        }}
                      >
                        <PdfIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={diagramLoading ? "Generating diagram..." : "Generate AI Diagram"} placement="top">
                      <IconButton
                        size="small"
                        onClick={handleGenerateDiagram}
                        disabled={diagramLoading}
                        sx={{
                          opacity: 0.8,
                          p: 0.25,
                          color: "#2563eb",
                          "&:hover": { opacity: 1, bgcolor: "rgba(37, 99, 235, 0.1)" },
                        }}
                      >
                        {diagramLoading ? <CircularProgress size={14} color="primary" /> : <PaletteIcon />}
                      </IconButton>
                    </Tooltip>

                    {onDelete && (
                      <Tooltip title="Delete question & response" placement="top">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(historyId, messageId)}
                          sx={{
                            opacity: 0.6,
                            p: 0.25,
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}>
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
                    px: 1.5,
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
                    px: 1.5,
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

        {!isUser && images && images.length > 0 && (
          <Box sx={{ mt: 1.5, pt: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 650, fontSize: "0.725rem", display: "block", mb: 0.75 }}>
              📷 Source Document Figures:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {images.map((img, idx) => (
                <Box
                  key={idx}
                  onClick={() => setPreviewModalImg({ url: getImageUrl(img.url), caption: img.caption || "Source Document Figure" })}
                  sx={{
                    width: 120,
                    height: 85,
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    position: "relative",
                    bgcolor: "#f8fafc",
                    "&:hover": { borderColor: "#2563eb", boxShadow: "0 2px 8px rgba(37,99,235,0.2)" },
                  }}
                >
                  <Box component="img" src={getImageUrl(img.url)} alt="Source Figure" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {!isUser && diagrams && diagrams.length > 0 && (
          <Box sx={{ mt: 1.5, pt: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 650, fontSize: "0.725rem", display: "block", mb: 0.75 }}>
              🎨 Generated Visual Diagrams:
            </Typography>
            <Stack spacing={1.25}>
              {diagrams.map((diag, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 1,
                    borderRadius: "8px",
                    border: "1px solid #bfdbfe",
                    bgcolor: "#eff6ff",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.725rem", color: "#1e40af" }}>
                      {diag.caption || "AI Generated Meteorological Diagram"}
                    </Typography>
                    <Chip label={diag.provider || "AI Model"} size="small" sx={{ height: 18, fontSize: "0.625rem", bgcolor: "#dbeafe", color: "#1d4ed8" }} />
                  </Box>
                  <Box
                    component="img"
                    src={getImageUrl(diag.url)}
                    alt="AI Diagram"
                    onClick={() => setPreviewModalImg({ url: getImageUrl(diag.url), caption: diag.caption })}
                    sx={{
                      width: "100%",
                      maxHeight: 260,
                      objectFit: "contain",
                      borderRadius: "6px",
                      bgcolor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer",
                    }}
                  />
                </Paper>
              ))}
            </Stack>
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
            width: 32,
            height: 32,
            mt: 0.25,
            flexShrink: 0,
          }}
        >
          <UserIcon />
        </Avatar>
      )}

      <Dialog open={Boolean(previewModalImg)} onClose={() => setPreviewModalImg(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 2, bgcolor: "#0f172a", textAlign: "center" }}>
          {previewModalImg && (
            <Box>
              <Typography variant="subtitle2" sx={{ color: "#ffffff", mb: 1.5, fontWeight: 600 }}>
                {previewModalImg.caption}
              </Typography>
              <Box
                component="img"
                src={getImageUrl(previewModalImg.url)}
                alt="Full Preview"
                sx={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: "8px", objectFit: "contain", bgcolor: "#ffffff", p: 0.5 }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1.5 }}>
                <Button size="small" variant="outlined" onClick={() => setPreviewModalImg(null)} sx={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.4)" }}>
                  Close
                </Button>
                <Button size="small" variant="contained" component="a" href={getImageUrl(previewModalImg.url)} target="_blank" download sx={{ textTransform: "none" }}>
                  Download Image
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Message;
