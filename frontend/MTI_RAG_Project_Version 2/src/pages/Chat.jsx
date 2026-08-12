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
      const message = formatErrorMessage(err?.response?.data?.detail, "Unable to load conversation threads.");
      setError(message);
      setThreads([]);
      return [];
    }
  };

  useEffect(() => {
    const initData = async () => {
      await getOrInitAnonymousSession();
      setError("");
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
          historyId: record.id,
          role: "user",
          text: record.question || "",
          timestamp: formatTime(record.timestamp),
        },
        {
          id: `a-${record.id}`,
          historyId: record.id,
          role: "assistant",
          text: record.answer || "",
          references: record.sources || [],
          timestamp: formatTime(record.timestamp),
        },
      ]);
      setMessages(mappedMessages);
    } catch (err) {
      const message = formatErrorMessage(err?.response?.data?.detail, "Failed to load thread messages.");
      setError(message);
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

    // 4. Download Conversation PDF
    const downloadKeywords = [
      "download conversation",
      "export pdf",
      "download pdf",
      "save pdf",
      "export conversation",
      "save transcript",
      "download transcript",
    ];
    if (downloadKeywords.some((kw) => clean.includes(kw))) {
      handleDownloadConversation();
      setVoiceActionToast("🎙️ Voice Command Executed: Downloading conversation transcript as PDF.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 5. Toggle Dark Mode Commands
    const themeKeywords = ["toggle dark mode", "dark mode", "light mode", "switch theme", "change theme", "toggle theme"];
    if (themeKeywords.some((kw) => clean.includes(kw))) {
      toggleDarkMode();
      setVoiceActionToast("🎙️ Voice Command Executed: Switched Theme mode.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 6. Response Mode Commands
    if (clean.includes("basic mode") || clean.includes("set mode to basic") || clean.includes("simple mode")) {
      setResponseMode("basic");
      setVoiceActionToast("🎙️ Voice Command Executed: Switched response mode to 🌱 Basic Language.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }
    if (clean.includes("moderate mode") || clean.includes("set mode to moderate") || clean.includes("standard mode")) {
      setResponseMode("moderate");
      setVoiceActionToast("🎙️ Voice Command Executed: Switched response mode to ⚖️ Moderate Level.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }
    if (clean.includes("research mode") || clean.includes("set mode to research") || clean.includes("in-depth mode") || clean.includes("expert mode")) {
      setResponseMode("research");
      setVoiceActionToast("🎙️ Voice Command Executed: Switched response mode to 🔬 In-Depth Research.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 7. Scroll Commands
    if (clean.includes("scroll to top") || clean.includes("go to top") || clean.includes("top of page")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setVoiceActionToast("🎙️ Voice Command Executed: Scrolled to top.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }
    if (clean.includes("scroll to bottom") || clean.includes("go to bottom") || clean.includes("bottom of page")) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setVoiceActionToast("🎙️ Voice Command Executed: Scrolled to bottom.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 8. Voice Command Help
    const helpKeywords = ["voice help", "show commands", "help menu", "voice commands", "show voice commands", "what can i say"];
    if (helpKeywords.some((kw) => clean.includes(kw))) {
      setVoiceControlOpen(true);
      setVoiceActionToast("🎙️ Voice Command Executed: Opened Voice Command Center.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }



    // 10. Delete Last Message Pair
    const deleteMsgKeywords = ["delete last message", "remove last question", "delete question", "remove question", "delete message"];
    if (deleteMsgKeywords.some((kw) => clean.includes(kw))) {
      const assistantMsgs = messages.filter((m) => m.role === "assistant" && m.historyId);
      if (assistantMsgs.length > 0) {
        const lastMsg = assistantMsgs[assistantMsgs.length - 1];
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

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await askQuestion(text, responseMode, activeThreadId);

      const assistantMessage = {
        id: response.id,
        historyId: response.id,
        role: "assistant",
        text: response.answer,
        references: response.sources || [],
        images: response.images || [],
        timestamp: new Date(response.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setActiveThreadId(response.thread_id);
      await loadThreads();
    } catch (err) {
      const message = formatErrorMessage(err?.response?.data?.detail, err?.message ? `Unable to reach assistant backend (${err.message}).` : "Unable to get response from assistant.");
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
      const message = formatErrorMessage(err?.response?.data?.detail, "Failed to rename thread.");
      setError(message);
    }
  };

  const handleDeleteMessagePair = async (historyId, messageId) => {
    try {
      if (historyId) {
        await deleteHistoryItem(historyId);
      }
      setMessages((prev) =>
        prev.filter((m) => {
          if (historyId && m.historyId === historyId) return false;
          if (m.id === messageId) return false;
          if (messageId && typeof messageId === "string") {
            if (messageId.startsWith("q-") && m.id === `a-${messageId.replace("q-", "")}`) return false;
            if (messageId.startsWith("a-") && m.id === `q-${messageId.replace("a-", "")}`) return false;
          }
          return true;
        })
      );
      await loadThreads();
    } catch (err) {
      const message = formatErrorMessage(err?.response?.data?.detail, "Failed to delete question.");
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
      const message = formatErrorMessage(err?.response?.data?.detail, "Failed to delete thread.");
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
      const message = formatErrorMessage(err?.response?.data?.detail, "Failed to clear all chat history.");
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
        images: response.images || [],
        timestamp: formatTime(response.timestamp),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setActiveThreadId(response.thread_id);
      await loadThreads();
    } catch (err) {
      const message = formatErrorMessage(err?.response?.data?.detail, err?.message ? `Unable to reach assistant backend (${err.message}).` : "Unable to get response from assistant.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = async () => {
    clearSession();
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
    await getOrInitAnonymousSession();
    await loadThreads();
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