import { Box, Button, Divider, IconButton, List, ListItemButton, ListItemText, Typography } from "@mui/material";

function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

function Sidebar({ chats = [], selectedChatId = null, onNewChat, onSelectChat, onDeleteChat }) {
  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Button variant="contained" fullWidth onClick={onNewChat} startIcon={<PlusIcon />}>
          New Chat
        </Button>
      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          Previous Chats
        </Typography>
      </Box>

      <List sx={{ pt: 0, px: 1, overflowY: "auto", flex: 1 }}>
        {chats.length === 0 ? (
          <Typography sx={{ px: 2, py: 1 }} variant="body2" color="text.secondary">
            No past conversations found.
          </Typography>
        ) : (
          chats.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            return (
              <ListItemButton
                key={chat.id}
                selected={isSelected}
                onClick={() => onSelectChat && onSelectChat(chat.id)}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    fontWeight: 600,
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" noWrap fontWeight={isSelected ? 600 : 400}>
                      {chat.title}
                    </Typography>
                  }
                />
                {onDeleteChat && chat.id !== "current" && (
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label="delete conversation"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    sx={{
                      opacity: 0.6,
                      "&:hover": { opacity: 1, color: "error.main" },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </ListItemButton>
            );
          })
        )}
      </List>
    </Box>
  );
}

export default Sidebar;

