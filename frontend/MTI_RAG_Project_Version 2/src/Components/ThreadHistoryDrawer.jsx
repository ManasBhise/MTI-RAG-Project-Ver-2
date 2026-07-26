import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  InputBase,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function HistoryClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

function JumpIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

function ThreadHistoryDrawer({ open, onClose, messages = [], threadTitle = "Active Conversation", onJumpToMessage, onDeleteQuestion }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Group user question messages
  const turns = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user") {
      turns.push({
        turnIndex: turns.length + 1,
        userMessage: msg,
      });
    }
  }

  const filteredTurns = turns.filter((turn) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const questionText = turn.userMessage?.text?.toLowerCase() || "";
    return questionText.includes(q);
  });

  const handleCopyQuestion = (turn) => {
    const text = turn.userMessage?.text || "";
    navigator.clipboard.writeText(text);
    setCopiedId(turn.turnIndex);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 380 },
          bgcolor: "background.paper",
          color: "text.primary",
          display: "flex",
          flexDirection: "column",
          textAlign: "left",
          borderLeft: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ color: "#2563eb", display: "flex", alignItems: "center" }}>
              <HistoryClockIcon />
            </Box>
            <Typography variant="h6" sx={{ fontSize: "0.95rem", fontWeight: 700, color: "text.primary" }}>
              Conversation History
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.725rem" }}>
            {threadTitle} • <strong>{turns.length} question{turns.length === 1 ? "" : "s"}</strong> saved
          </Typography>
        </Box>

        {/* Filter Input */}
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1.25,
            py: 0.5,
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
          }}
        >
          <InputAdornment position="start" sx={{ color: "text.secondary", mr: 1 }}>
            <SearchIcon />
          </InputAdornment>
          <InputBase
            placeholder="Search past questions in thread..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ fontSize: "0.775rem", flex: 1, color: "text.primary" }}
          />
        </Paper>
      </Box>

      {/* Questions List */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 1.75 }}>
        {filteredTurns.length === 0 ? (
          <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
              {searchQuery ? "No matching questions found." : "No saved questions in this conversation yet."}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filteredTurns.map((turn) => (
              <Paper
                key={turn.turnIndex}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "action.hover",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "#2563eb",
                    bgcolor: "action.selected",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.12)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                  <Chip
                    label={`Question #${turn.turnIndex}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      bgcolor: "rgba(37, 99, 235, 0.15)",
                      color: "#2563eb",
                      borderRadius: "5px",
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.675rem" }}>
                    {turn.userMessage?.timestamp || ""}
                  </Typography>
                </Box>

                {/* Question Text Only */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.8375rem", color: "text.primary", mb: 1.25, lineHeight: 1.4 }}>
                  {turn.userMessage?.text || ""}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.75 }}>
                  <Tooltip title="Copy question" placement="top">
                    <Button
                      size="small"
                      onClick={() => handleCopyQuestion(turn)}
                      startIcon={copiedId === turn.turnIndex ? <CheckIcon /> : <CopyIcon />}
                      sx={{
                        fontSize: "0.7rem",
                        py: 0.3,
                        px: 1,
                        textTransform: "none",
                        color: copiedId === turn.turnIndex ? "#16a34a" : "text.secondary",
                        fontWeight: 600,
                      }}
                    >
                      {copiedId === turn.turnIndex ? "Copied" : "Copy"}
                    </Button>
                  </Tooltip>

                  <Tooltip title="Jump to chat" placement="top">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (onJumpToMessage && turn.userMessage?.id) {
                          onJumpToMessage(turn.userMessage.id);
                          onClose();
                        }
                      }}
                      endIcon={<JumpIcon />}
                      sx={{
                        fontSize: "0.7rem",
                        py: 0.3,
                        px: 1,
                        borderRadius: "6px",
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "divider",
                        color: "#2563eb",
                        "&:hover": {
                          borderColor: "#2563eb",
                          bgcolor: "rgba(37, 99, 235, 0.08)",
                        },
                      }}
                    >
                      Jump to chat
                    </Button>
                  </Tooltip>

                  {onDeleteQuestion && (
                    <Tooltip title="Delete question & answer" placement="top">
                      <Button
                        size="small"
                        onClick={() => onDeleteQuestion(turn.userMessage?.historyId, turn.userMessage?.id)}
                        startIcon={<TrashIcon />}
                        sx={{
                          fontSize: "0.7rem",
                          py: 0.3,
                          px: 1,
                          textTransform: "none",
                          color: "#ef4444",
                          fontWeight: 600,
                          "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" },
                        }}
                      >
                        Delete
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      <Divider sx={{ borderColor: "divider" }} />
      <Box sx={{ p: 1.5, textAlign: "center", bgcolor: "background.paper" }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6875rem" }}>
          Subsequent queries automatically inherit previous chat context
        </Typography>
      </Box>
    </Drawer>
  );
}

export default ThreadHistoryDrawer;
