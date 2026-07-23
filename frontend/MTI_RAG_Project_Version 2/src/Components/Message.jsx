import { useState } from "react";
import { Avatar, Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";

function RobotIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
      <circle cx="12" cy="5" r="2"></circle>
      <path d="M12 7v4"></path>
      <line x1="8" y1="16" x2="8.01" y2="16"></line>
      <line x1="16" y1="16" x2="16.01" y2="16"></line>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
  );
}

function Message({ role, text, references = [], timestamp }) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1.5, justifyContent: isUser ? "flex-end" : "flex-start", my: 1 }}>
      {!isUser && (
        <Avatar sx={{ bgcolor: "primary.main", color: "#fff", width: 36, height: 36, mt: 0.5 }}>
          <RobotIcon />
        </Avatar>
      )}

      <Paper
        elevation={0}
        sx={{
          maxWidth: { xs: "90%", md: "78%" },
          px: 2.5,
          py: 2,
          borderRadius: 3,
          bgcolor: isUser ? "primary.main" : "background.paper",
          color: isUser ? "primary.contrastText" : "text.primary",
          border: isUser ? "none" : "1px solid",
          borderColor: "divider",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6, flex: 1 }}>
            {text}
          </Typography>

          {!isUser && text && (
            <Tooltip title={copied ? "Copied!" : "Copy response"} placement="top">
              <IconButton size="small" onClick={handleCopy} sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {!isUser && references.length > 0 && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
              Document Sources:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
              {references.map((ref, idx) => (
                <Chip
                  key={idx}
                  icon={<DocumentIcon />}
                  size="small"
                  label={ref}
                  variant="outlined"
                  sx={{ borderRadius: 1.5, fontSize: "0.75rem", bgcolor: "grey.50" }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {timestamp && (
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              display: "block",
              textAlign: isUser ? "right" : "left",
              opacity: isUser ? 0.85 : 0.6,
              fontSize: "0.7rem",
            }}
          >
            {timestamp}
          </Typography>
        )}
      </Paper>

      {isUser && (
        <Avatar sx={{ bgcolor: "grey.400", color: "#fff", width: 36, height: 36, mt: 0.5 }}>
          <UserIcon />
        </Avatar>
      )}
    </Box>
  );
}

export default Message;

