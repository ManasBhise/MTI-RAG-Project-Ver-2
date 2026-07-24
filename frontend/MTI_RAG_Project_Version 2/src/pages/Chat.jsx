import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Drawer, Stack, Typography } from "@mui/material";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import Message from "../Components/Message";
import ChatInput from "../Components/ChatInput";
import SettingsModal from "../Components/SettingsModal";
import ThreadHistoryDrawer from "../Components/ThreadHistoryDrawer";
import {
  askQuestion,
  clearSession,
  deleteAllHistory,
  deleteThread,
  fetchThreadMessages,
  fetchThreads,
  getStoredUser,
  logoutUser,
  renameThread,
} from "../services/api";

function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [responseMode, setResponseMode] = useState("moderate");
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Welcome to the Meteorological Training Institute Knowledge Repository. You may query official training literature, weather observation manuals, and meteorological documentations.",
      references: ["MTI Knowledge Base Index"],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const user = getStoredUser();

  const formatTime = (ts) => {
    if (!ts) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    try {
      const d = new Date(ts);
      return isNaN(d.getTime())
        ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  const chatList = useMemo(
    () =>
      Array.isArray(threads)
        ? threads.map((t) => ({
            id: t.id,
            title: t.title || "Untitled Chat",
          }))
        : [],
    [threads]
  );

  const activeThread = useMemo(
    () => (Array.isArray(threads) ? threads.find((t) => t.id === activeThreadId) : null),
    [threads, activeThreadId]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadThreads = async () => {
    try {
      const data = await fetchThreads();
      if (Array.isArray(data)) {
        setThreads(data);
        return data;
      }
      setThreads([]);
      return [];
    } catch (err) {
      const message = err?.response?.data?.detail || "Unable to load conversation threads.";
      setError(message);
      setThreads([]);
      return [];
    }
  };

  useEffect(() => {
    const initData = async () => {
      const threadData = await loadThreads();
      if (Array.isArray(threadData) && threadData.length > 0) {
        const latest = threadData[0];
        setActiveThreadId(latest.id);
        await loadMessagesForThread(latest.id);
      }
    };
    initData();
  }, []);

  const loadMessagesForThread = async (threadId) => {
    try {
      const records = await fetchThreadMessages(threadId);
      if (!Array.isArray(records)) {
        return;
      }
      const mappedMessages = records.flatMap((record) => [
        {
          id: `q-${record.id}`,
          role: "user",
          text: record.question || "",
          timestamp: formatTime(record.timestamp),
        },
        {
          id: `a-${record.id}`,
          role: "assistant",
          text: record.answer || "",
          references: record.sources || [],
          timestamp: formatTime(record.timestamp),
        },
      ]);
      setMessages(mappedMessages);
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to load thread messages.";
      setError(message);
    }
  };

  const handleSend = async (text) => {
    setError("");

    const userMessage = {
      id: Date.now(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await askQuestion(text, responseMode, activeThreadId);

      const assistantMessage = {
        id: response.id,
        role: "assistant",
        text: response.answer,
        references: response.sources || [],
        timestamp: new Date(response.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setActiveThreadId(response.thread_id);
      await loadThreads();
    } catch (err) {
      const message = err?.response?.data?.detail || "Unable to get response from assistant.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = async (threadId) => {
    setActiveThreadId(threadId);
    setMobileSidebarOpen(false);
    await loadMessagesForThread(threadId);
  };

  const handleRenameThread = async (threadId, newTitle) => {
    try {
      await renameThread(threadId, newTitle);
      await loadThreads();
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to rename thread.";
      setError(message);
    }
  };

  const handleDeleteThread = async (threadId) => {
    try {
      await deleteThread(threadId);
      const updated = await loadThreads();

      if (activeThreadId === threadId) {
        if (updated.length > 0) {
          setActiveThreadId(updated[0].id);
          await loadMessagesForThread(updated[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to delete thread.";
      setError(message);
    }
  };

  const handleDeleteAllHistory = async () => {
    try {
      await deleteAllHistory();
      setThreads([]);
      setActiveThreadId(null);
      setMessages([
        {
          id: "welcome-1",
          role: "assistant",
          text: "Welcome to the Meteorological Training Institute Knowledge Repository. You may query official training literature, weather observation manuals, and meteorological documentations.",
          references: ["MTI Knowledge Base Index"],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to clear all chat history.";
      setError(message);
      throw err;
    }
  };

  const handleNewChat = () => {
    setError("");
    setActiveThreadId(null);
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text: "New conversation thread initialized. Please submit your query regarding MTI documentation.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setMobileSidebarOpen(false);
  };

  const handleEditMessage = async (messageId, newText, newMode) => {
    setError("");

    // Find the index of the user message being edited
    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Keep only messages before the edited message
    const previousMessages = messages.slice(0, msgIndex);

    // Create the updated user message
    const updatedUserMessage = {
      id: Date.now(),
      role: "user",
      text: newText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...previousMessages, updatedUserMessage]);
    setResponseMode(newMode);
    setLoading(true);

    try {
      const response = await askQuestion(newText, newMode, activeThreadId);

      const assistantMessage = {
        id: response.id,
        role: "assistant",
        text: response.answer,
        references: response.sources || [],
        timestamp: formatTime(response.timestamp),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setActiveThreadId(response.thread_id);
      await loadThreads();
    } catch (err) {
      const message = err?.response?.data?.detail || "Unable to get response from assistant.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      
    } finally {
      clearSession();
      navigate("/", { replace: true });
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", bgcolor: "background.default", overflow: "hidden", textAlign: "left" }}>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          height: "100%",
          width: desktopSidebarOpen ? 260 : 0,
          minWidth: desktopSidebarOpen ? 260 : 0,
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <Sidebar
          chats={chatList}
          selectedChatId={activeThreadId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectThread}
          onDeleteChat={handleDeleteThread}
          onRenameThread={handleRenameThread}
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleCollapse={() => setDesktopSidebarOpen(false)}
        />
      </Box>

      <Drawer
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Sidebar
          chats={chatList}
          selectedChatId={activeThreadId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectThread}
          onDeleteChat={handleDeleteThread}
          onRenameThread={handleRenameThread}
          onOpenSettings={() => {
            setMobileSidebarOpen(false);
            setSettingsOpen(true);
          }}
        />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%" }}>
        <Navbar
          onToggleSidebar={() => {
            if (window.innerWidth < 900) {
              setMobileSidebarOpen((prev) => !prev);
            } else {
              setDesktopSidebarOpen((prev) => !prev);
            }
          }}
          isSidebarOpen={desktopSidebarOpen}
          userName={user?.name || "MTI User"}
          onLogout={handleLogout}
          onOpenHistory={() => setHistoryDrawerOpen(true)}
        />

        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 3 } }}>
          <Box sx={{ maxWidth: "960px", mx: "auto", width: "100%" }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: "8px", fontSize: "0.8125rem" }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {messages.length === 0 ? (
              <Box sx={{ py: 6, px: 2, textAlign: "left" }}>
                <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600, color: "text.primary", mb: 0.5 }}>
                  Welcome to MTI Knowledge Assistant (Beta)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8375rem" }}>
                  Ask any question regarding MTI meteorological training documentation, weather observation guidelines, and institute courseware.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {messages.map((message) => (
                  <div key={message.id} id={message.id}>
                    <Message
                      role={message.role}
                      text={message.text}
                      references={message.references}
                      timestamp={message.timestamp}
                      messageId={message.id}
                      onEdit={message.role === "user" ? handleEditMessage : undefined}
                    />
                  </div>
                ))}

                {loading && (
                  <Message
                    role="assistant"
                    isLoading={true}
                  />
                )}
                <div ref={messagesEndRef} />
              </Stack>
            )}
          </Box>
        </Box>

        <Box sx={{ maxWidth: "960px", mx: "auto", width: "100%" }}>
          <ChatInput onSend={handleSend} disabled={loading} mode={responseMode} onModeChange={setResponseMode} />
        </Box>
      </Box>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onDeleteAllHistory={handleDeleteAllHistory}
      />

      <ThreadHistoryDrawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        messages={messages}
        threadTitle={activeThread?.title || "Active Conversation"}
        onJumpToMessage={(msgId) => {
          const el = document.getElementById(msgId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }}
      />
    </Box>
  );
}

export default Chat;