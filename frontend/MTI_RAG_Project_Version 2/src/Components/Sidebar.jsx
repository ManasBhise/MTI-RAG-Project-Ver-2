import { useState } from "react";
import { Box, Button, Divider, IconButton, InputBase, List, ListItemButton, ListItemText, Tooltip, Typography } from "@mui/material";

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

function ChatMessageIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

function SidebarCollapseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="3" x2="9" y2="21"></line>
      <path d="M15 10l-2 2 2 2"></path>
    </svg>
  );
}

function PdfDownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M12 18v-6"></path>
      <path d="m9 15 3 3 3-3"></path>
    </svg>
  );
}

function Sidebar({ chats = [], selectedChatId = null, onNewChat, onSelectChat, onDeleteChat, onRenameThread, onOpenSettings, onToggleCollapse, onDownloadConversation }) {
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingThreadId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = async (e, threadId) => {
    if (e) e.stopPropagation();
    if (editTitle.strip && editTitle.trim().length > 0 && onRenameThread) {
      await onRenameThread(threadId, editTitle.trim());
    }
    setEditingThreadId(null);
  };

  const handleCancelRename = (e) => {
    if (e) e.stopPropagation();
    setEditingThreadId(null);
  };

  const safeChats = Array.isArray(chats) ? chats : [];

  return (
    <Box
      sx={{
        width: 260,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        textAlign: "left",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2, pb: 1.5 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onNewChat}
          startIcon={
            <Box sx={{ display: "inline-flex", p: 0.4, borderRadius: "6px", bgcolor: "rgba(255, 255, 255, 0.2)" }}>
              <PlusIcon />
            </Box>
          }
          sx={{
            py: 1.1,
            px: 2,
            borderRadius: "10px",
            fontSize: "0.8375rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            textTransform: "none",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            boxShadow: "0 4px 12px 0 rgba(37, 99, 235, 0.28)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              boxShadow: "0 6px 16px 0 rgba(37, 99, 235, 0.4)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
              boxShadow: "0 2px 8px 0 rgba(37, 99, 235, 0.3)",
            },
          }}
        >
          New Conversation
        </Button>

        {onToggleCollapse && (
          <Tooltip title="Collapse sidebar" placement="bottom">
            <IconButton
              size="small"
              onClick={onToggleCollapse}
              sx={{
                color: "text.secondary",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                p: 0.8,
                flexShrink: 0,
                "&:hover": { bgcolor: "action.hover", color: "text.primary" },
              }}
            >
              <SidebarCollapseIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ borderColor: "divider", opacity: 0.6 }} />

      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6875rem" }}>
          Conversations
        </Typography>
      </Box>

      <List sx={{ pt: 0, px: 1.25, overflowY: "auto", flex: 1 }}>
        {safeChats.length === 0 ? (
          <Typography sx={{ px: 1.5, py: 2, fontSize: "0.8125rem" }} color="text.secondary">
            No active threads yet.
          </Typography>
        ) : (
          safeChats.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            const isEditing = editingThreadId === chat.id;

            return (
              <ListItemButton
                key={chat.id}
                selected={isSelected}
                onClick={() => !isEditing && onSelectChat && onSelectChat(chat.id)}
                sx={{
                  borderRadius: "6px",
                  mb: 0.5,
                  py: 0.75,
                  px: 1.25,
                  gap: 1,
                  borderLeft: isSelected ? "3px solid #2563eb" : "3px solid transparent",
                  bgcolor: isSelected ? "rgba(37, 99, 235, 0.06)" : "transparent",
                  "&:hover": {
                    bgcolor: isSelected ? "action.selected" : "action.hover",
                    "& .action-btn": { opacity: 0.8 },
                  },
                }}
              >
                <ChatMessageIcon />

                {isEditing ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }} onClick={(e) => e.stopPropagation()}>
                    <InputBase
                      autoFocus
                      size="small"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(e, chat.id);
                        if (e.key === "Escape") handleCancelRename(e);
                      }}
                      sx={{
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        px: 0.75,
                        py: 0.1,
                        bgcolor: "#ffffff",
                        border: "1px solid #2563eb",
                        borderRadius: "4px",
                        flex: 1,
                      }}
                    />
                    <IconButton size="small" onClick={(e) => handleSaveRename(e, chat.id)} sx={{ p: 0.25, color: "#16a34a" }}>
                      <CheckIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancelRename} sx={{ p: 0.25, color: "#64748b" }}>
                      <CancelIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            fontSize: "0.8125rem",
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? "#1e40af" : "text.primary",
                            textAlign: "left",
                          }}
                        >
                          {chat.title}
                        </Typography>
                      }
                    />

                    {chat.id !== "current" && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                        {onDownloadConversation && isSelected && (
                          <Tooltip title="Export conversation as PDF" placement="top">
                            <IconButton
                              size="small"
                              className="action-btn"
                              aria-label="export pdf"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDownloadConversation();
                              }}
                              sx={{
                                p: 0.4,
                                opacity: 0,
                                transition: "opacity 0.2s",
                                color: "text.secondary",
                                "&:hover": { color: "#2563eb" },
                              }}
                            >
                              <PdfDownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {onRenameThread && (
                          <IconButton
                            size="small"
                            className="action-btn"
                            aria-label="rename thread"
                            onClick={(e) => handleStartRename(e, chat)}
                            sx={{
                              p: 0.4,
                              opacity: 0,
                              transition: "opacity 0.2s",
                              color: "text.secondary",
                              "&:hover": { color: "#2563eb" },
                            }}
                          >
                            <PencilIcon />
                          </IconButton>
                        )}

                        {onDeleteChat && (
                          <IconButton
                            size="small"
                            className="action-btn"
                            aria-label="delete conversation"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                            sx={{
                              p: 0.4,
                              opacity: 0,
                              transition: "opacity 0.2s",
                              color: "text.secondary",
                              "&:hover": { color: "#ef4444" },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </ListItemButton>
            );
          })
        )}
      </List>

      {onOpenSettings && (
        <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button
            fullWidth
            onClick={onOpenSettings}
            startIcon={<SettingsIcon />}
            sx={{
              justifyContent: "flex-start",
              color: "text.secondary",
              fontSize: "0.8125rem",
              fontWeight: 500,
              textTransform: "none",
              borderRadius: "8px",
              py: 0.8,
              px: 1.25,
              "&:hover": {
                bgcolor: "action.hover",
                color: "text.primary",
              },
            }}
          >
            Settings & Preferences
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Sidebar;
