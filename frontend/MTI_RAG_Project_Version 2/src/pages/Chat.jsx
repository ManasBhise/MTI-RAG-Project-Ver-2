import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Drawer, Stack, Typography } from "@mui/material";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import Message from "../Components/Message";
import ChatInput from "../Components/ChatInput";
import SettingsModal from "../Components/SettingsModal";
import ThreadHistoryDrawer from "../Components/ThreadHistoryDrawer";
import VoiceControlModal from "../Components/VoiceControlModal";
import { useThemeMode } from "../App";
import { exportFullConversationToPdf } from "../utils/exportPdf";
import {
  askQuestion,
  clearSession,
  deleteAllHistory,
  deleteHistoryItem,
  deleteThread,
  fetchThreadMessages,
  fetchThreads,
  getOrInitAnonymousSession,
  getStoredUser,
  renameThread,
} from "../services/api";
import { formatErrorMessage } from "../utils/formatError";

function Chat() {
  const messagesEndRef = useRef(null);

  const { toggleDarkMode } = useThemeMode();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [voiceControlOpen, setVoiceControlOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceActionToast, setVoiceActionToast] = useState("");
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [responseMode, setResponseMode] = useState("moderate");
  const threadStoreRef = useRef({});
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

  const handleDownloadConversation = () => {
    if (!messages || messages.length === 0) return;
    exportFullConversationToPdf({
      threadTitle: activeThread?.title || "Active Conversation",
      messages,
    });
  };

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

  useEffect(() => {
    const initData = async () => {
      await getOrInitAnonymousSession();
      setError("");
    };
    initData();
  }, []);

  const loadMessagesForThread = (threadId) => {
    if (threadStoreRef.current[threadId]) {
      setMessages(threadStoreRef.current[threadId]);
    }
  };

  const checkAndExecuteVoiceCommand = (rawText) => {
    if (!rawText) return false;
    const clean = rawText.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    // 1. New Conversation Commands
    const newChatKeywords = [
      "new conversation",
      "start new conversation",
      "new chat",
      "start new chat",
      "create new conversation",
      "clear chat",
      "start a new chat",
      "start a new conversation",
      "reset chat",
      "clear conversation",
      "new thread",
      "start new thread",
    ];
    if (newChatKeywords.some((kw) => clean.includes(kw))) {
      handleNewChat();
      setVoiceActionToast("🎙️ Voice Command Executed: Started a new conversation thread.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 2. Open Settings Commands
    const settingsKeywords = [
      "open settings",
      "show settings",
      "open preferences",
      "show preferences",
      "open setting",
      "show setting",
      "view settings",
      "settings",
      "setting",
      "preferences",
    ];
    if (settingsKeywords.some((kw) => clean.includes(kw))) {
      setSettingsOpen(true);
      setVoiceActionToast("🎙️ Voice Command Executed: Opened Settings & Personalization.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 3. Open History Commands
    const historyKeywords = [
      "open history",
      "show history",
      "view history",
      "conversation history",
      "open drawer",
      "show drawer",
      "chat history",
      "open threads",
      "history",
    ];
    if (historyKeywords.some((kw) => clean.includes(kw))) {
      setHistoryDrawerOpen(true);
      setVoiceActionToast("🎙️ Voice Command Executed: Opened Conversation History.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 4. Voice Mode switching commands
    if (clean.includes("concise mode") || clean.includes("switch to concise") || clean.includes("set concise")) {
      setResponseMode("concise");
      setVoiceActionToast("🎙️ Voice Command Executed: Switched response depth to Concise.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }
    if (clean.includes("detailed mode") || clean.includes("switch to detailed") || clean.includes("set detailed")) {
      setResponseMode("detailed");
      setVoiceActionToast("🎙️ Voice Command Executed: Switched response depth to Detailed.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }
    if (clean.includes("moderate mode") || clean.includes("switch to moderate") || clean.includes("set moderate")) {
      setResponseMode("moderate");
      setVoiceActionToast("🎙️ Voice Command Executed: Switched response depth to Moderate.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 5. Light / Dark Theme Switching Commands
    if (clean.includes("dark mode") || clean.includes("enable dark mode") || clean.includes("switch to dark")) {
      toggleDarkMode(true);
      setVoiceActionToast("🎙️ Voice Command Executed: Enabled Dark Theme.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }
    if (clean.includes("light mode") || clean.includes("enable light mode") || clean.includes("switch to light")) {
      toggleDarkMode(false);
      setVoiceActionToast("🎙️ Voice Command Executed: Enabled Light Theme.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 6. Stop TTS / Speaking Commands
    const stopSpeechKeywords = ["stop speaking", "stop reading", "quiet", "silence", "stop voice", "mute"];
    if (stopSpeechKeywords.some((kw) => clean === kw || clean.startsWith(kw))) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setVoiceActionToast("🎙️ Voice Command Executed: Stopped Speech Output.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 7. Read Aloud / Speak Latest Answer Commands
    const speakKeywords = [
      "read answer",
      "read out",
      "read aloud",
      "speak answer",
      "speak latest",
      "read latest",
      "read out loud",
      "read the answer",
    ];
    if (speakKeywords.some((kw) => clean.includes(kw))) {
      const assistantMessages = messages.filter((m) => m.role === "assistant" && m.text);
      if (assistantMessages.length > 0) {
        const lastAnswer = assistantMessages[assistantMessages.length - 1].text;
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const cleanSpeech = lastAnswer
            .replace(/#{1,6}\s+/g, "")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
            .replace(/\[\d+\]/g, "")
            .trim();
          const utterance = new SpeechSynthesisUtterance(cleanSpeech.substring(0, 1000));
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
          setVoiceActionToast("🎙️ Voice Command Executed: Reading out latest assistant response.");
          setTimeout(() => setVoiceActionToast(""), 4000);
        }
      }
      return true;
    }

    // 8. Download / Export PDF Commands
    const downloadKeywords = ["download conversation", "export pdf", "download pdf", "export conversation", "save as pdf"];
    if (downloadKeywords.some((kw) => clean.includes(kw))) {
      handleDownloadConversation();
      setVoiceActionToast("🎙️ Voice Command Executed: Exported full conversation to PDF.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 9. Clear All History Commands
    const clearAllKeywords = ["delete all history", "clear all history", "delete all chats", "clear all chats", "wipe history"];
    if (clearAllKeywords.some((kw) => clean.includes(kw))) {
      handleDeleteAllHistory();
      setVoiceActionToast("🎙️ Voice Command Executed: Cleared all conversation history.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 10. Delete Latest Question Commands
    const deleteLatestKeywords = ["delete last question", "delete latest question", "delete last message", "delete latest message", "undo last message"];
    if (deleteLatestKeywords.some((kw) => clean.includes(kw))) {
      const assistantMessages = messages.filter((m) => m.role === "assistant" && m.historyId);
      if (assistantMessages.length > 0) {
        const lastMsg = assistantMessages[assistantMessages.length - 1];
        handleDeleteMessagePair(lastMsg.historyId);
        setVoiceActionToast("🎙️ Voice Command Executed: Deleted latest message pair.");
        setTimeout(() => setVoiceActionToast(""), 4000);
        return true;
      }
    }

    // 11. Reset Session Commands
    const resetKeywords = ["reset session", "new session", "clear session", "log out", "logout", "sign out"];
    if (resetKeywords.some((kw) => clean.includes(kw))) {
      setVoiceActionToast("🎙️ Voice Command Executed: Resetting session...");
      setTimeout(() => handleResetSession(), 1200);
      return true;
    }

    return false;
  };

  const handleSend = async (text) => {
    setError("");

    if (checkAndExecuteVoiceCommand(text)) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setLoading(true);

    // Build context history from recent Q&A turns in this active thread (In-Memory RAM)
    const recentHistory = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === "user" && messages[i + 1] && messages[i + 1].role === "assistant") {
        recentHistory.push({ question: m.text, answer: messages[i + 1].text });
      }
    }
    const historyPayload = recentHistory.slice(-4);

    try {
      const response = await askQuestion(text, responseMode, activeThreadId, historyPayload);

      const assistantMessage = {
        id: response.id,
        historyId: response.id,
        role: "assistant",
        text: response.answer,
        references: response.sources || [],
        images: response.images || [],
        timestamp: formatTime(response.timestamp),
      };

      const updatedMessages = [...currentMessages, assistantMessage];
      setMessages(updatedMessages);

      const threadId = response.thread_id || activeThreadId || `thread_${Date.now()}`;
      setActiveThreadId(threadId);
      threadStoreRef.current[threadId] = updatedMessages;

      setThreads((prev) => {
        const exists = prev.find((t) => t.id === threadId);
        if (exists) {
          return prev.map((t) => (t.id === threadId ? { ...t, updated_at: new Date() } : t));
        }
        const titleSnippet = text.length > 35 ? text.substring(0, 35) + "..." : text;
        return [{ id: threadId, title: titleSnippet, created_at: new Date(), updated_at: new Date() }, ...prev];
      });
    } catch (err) {
      const message = formatErrorMessage(err?.response?.data?.detail, err?.message ? `Unable to reach assistant backend (${err.message}).` : "Unable to get response from assistant.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = (threadId) => {
    if (activeThreadId) {
      threadStoreRef.current[activeThreadId] = messages;
    }
    setActiveThreadId(threadId);
    setMobileSidebarOpen(false);
    loadMessagesForThread(threadId);
  };

  const handleRenameThread = (threadId, newTitle) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, title: newTitle.trim() } : t))
    );
  };

  const handleDeleteMessagePair = (historyId, messageId) => {
    setMessages((prev) => {
      const updated = prev.filter((m) => {
        if (historyId && m.historyId === historyId) return false;
        if (m.id === messageId) return false;
        if (messageId && typeof messageId === "string") {
          if (messageId.startsWith("q-") && m.id === `a-${messageId.replace("q-", "")}`) return false;
          if (messageId.startsWith("a-") && m.id === `q-${messageId.replace("a-", "")}`) return false;
        }
        return true;
      });
      if (activeThreadId) {
        threadStoreRef.current[activeThreadId] = updated;
      }
      return updated;
    });
  };

  const handleDeleteThread = (threadId) => {
    delete threadStoreRef.current[threadId];
    setThreads((prev) => prev.filter((t) => t.id !== threadId));

    if (activeThreadId === threadId) {
      handleNewChat();
    }
  };

  const handleDeleteAllHistory = () => {
    threadStoreRef.current = {};
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
  };

  const handleNewChat = () => {
    if (activeThreadId) {
      threadStoreRef.current[activeThreadId] = messages;
    }
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

    const currentMessages = [...previousMessages, updatedUserMessage];
    setMessages(currentMessages);
    setResponseMode(newMode);
    setLoading(true);

    const recentHistory = [];
    for (let i = 0; i < previousMessages.length; i++) {
      const m = previousMessages[i];
      if (m.role === "user" && previousMessages[i + 1] && previousMessages[i + 1].role === "assistant") {
        recentHistory.push({ question: m.text, answer: previousMessages[i + 1].text });
      }
    }
    const historyPayload = recentHistory.slice(-4);

    try {
      const response = await askQuestion(newText, newMode, activeThreadId, historyPayload);

      const assistantMessage = {
        id: response.id,
        role: "assistant",
        text: response.answer,
        references: response.sources || [],
        images: response.images || [],
        timestamp: formatTime(response.timestamp),
      };

      const updated = [...currentMessages, assistantMessage];
      setMessages(updated);
      const threadId = response.thread_id || activeThreadId || `thread_${Date.now()}`;
      setActiveThreadId(threadId);
      threadStoreRef.current[threadId] = updated;
    } catch (err) {
      const message = formatErrorMessage(err?.response?.data?.detail, err?.message ? `Unable to reach assistant backend (${err.message}).` : "Unable to get response from assistant.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    clearSession();
    threadStoreRef.current = {};
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
  };

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        minHeight: "100dvh",
        maxHeight: "100dvh",
        display: "flex",
        bgcolor: "background.default",
        overflow: "hidden",
        textAlign: "left",
      }}
    >
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
          onDownloadConversation={handleDownloadConversation}
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
          onDownloadConversation={handleDownloadConversation}
          onOpenSettings={() => {
            setMobileSidebarOpen(false);
            setSettingsOpen(true);
          }}
        />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <Navbar
          onToggleSidebar={() => {
            if (window.innerWidth < 900) {
              setMobileSidebarOpen((prev) => !prev);
            } else {
              setDesktopSidebarOpen((prev) => !prev);
            }
          }}
          isSidebarOpen={desktopSidebarOpen}
          userName={user?.name || "Meteorologist"}
          onLogout={handleResetSession}
          onOpenHistory={() => setHistoryDrawerOpen(true)}
          onDownloadConversation={handleDownloadConversation}
          onOpenVoiceControl={() => setVoiceControlOpen(true)}
        />

        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 1.25, sm: 2, md: 3 }, WebkitOverflowScrolling: "touch" }}>
          <Box sx={{ maxWidth: "960px", mx: "auto", width: "100%" }}>
            {voiceActionToast && (
              <Alert
                severity="info"
                sx={{ mb: 2, borderRadius: "10px", fontSize: "0.8375rem", bgcolor: "rgba(37, 99, 235, 0.12)", color: "#1d4ed8", fontWeight: 600, border: "1px solid #bfdbfe" }}
                onClose={() => setVoiceActionToast("")}
              >
                {voiceActionToast}
              </Alert>
            )}

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
              <Stack spacing={{ xs: 1.5, sm: 2 }}>
                {messages.map((message, index) => {
                  let userQuestion = "";
                  if (message.role === "assistant") {
                    for (let i = index - 1; i >= 0; i--) {
                      if (messages[i].role === "user") {
                        userQuestion = messages[i].text;
                        break;
                      }
                    }
                  }

                  return (
                    <div key={message.id} id={message.id}>
                      <Message
                        role={message.role}
                        text={message.text}
                        references={message.references}
                        images={message.images}
                        timestamp={message.timestamp}
                        messageId={message.id}
                        historyId={message.historyId}
                        userQuestion={userQuestion}
                        onEdit={message.role === "user" ? handleEditMessage : undefined}
                        onDelete={handleDeleteMessagePair}
                      />
                    </div>
                  );
                })}

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

        <Box sx={{ maxWidth: "1350px", mx: "auto", width: "100%", px: { xs: 0, sm: 1, md: 2 } }}>
          <ChatInput
            onSend={handleSend}
            disabled={loading}
            mode={responseMode}
            onModeChange={setResponseMode}
            onVoiceCommand={checkAndExecuteVoiceCommand}
          />
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
        onDeleteQuestion={handleDeleteMessagePair}
        onJumpToMessage={(msgId) => {
          const el = document.getElementById(msgId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }}
      />
      <VoiceControlModal
        open={voiceControlOpen}
        onClose={() => setVoiceControlOpen(false)}
        onExecuteCommand={checkAndExecuteVoiceCommand}
      />
    </Box>
  );
}

export default Chat;