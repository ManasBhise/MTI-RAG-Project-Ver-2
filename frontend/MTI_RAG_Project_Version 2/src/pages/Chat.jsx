import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Drawer, Stack, Typography } from "@mui/material";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import Message from "../Components/Message";
import ChatInput from "../Components/ChatInput";
import SettingsModal from "../Components/SettingsModal";
import VoiceControlModal from "../Components/VoiceControlModal";
import { useThemeMode } from "../App";
import { exportFullConversationToPdf } from "../utils/exportPdf";
import {
  askQuestion,
  clearSession,
  getOrInitAnonymousSession,
  getStoredUser,
} from "../services/api";
import { formatErrorMessage } from "../utils/formatError";

function Chat() {
  const messagesEndRef = useRef(null);

  const { toggleDarkMode } = useThemeMode();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceControlOpen, setVoiceControlOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceActionToast, setVoiceActionToast] = useState("");
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [responseMode, setResponseMode] = useState("moderate");
  const threadStoreRef = useRef({});
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
      threadTitle: "MTI Assistant Session",
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

  const handleClearChat = () => {
    setActiveThreadId(null);
    threadStoreRef.current = {};
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

  const handleResetSession = async () => {
    clearSession();
    handleClearChat();
    await getOrInitAnonymousSession();
  };

  const checkAndExecuteVoiceCommand = (rawText) => {
    if (!rawText) return false;
    const clean = rawText.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    // 1. Clear Chat / Reset Session Commands
    const clearChatKeywords = [
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
      "reset session",
      "clear session",
    ];
    if (clearChatKeywords.some((kw) => clean.includes(kw))) {
      handleClearChat();
      setVoiceActionToast("🎙️ Voice Command Executed: Cleared active conversation.");
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

    // 3. Voice Mode switching commands
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

    // 4. Light / Dark Theme Switching Commands
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

    // 5. Stop TTS / Speaking Commands
    const stopSpeechKeywords = ["stop speaking", "stop reading", "quiet", "silence", "stop voice", "mute"];
    if (stopSpeechKeywords.some((kw) => clean === kw || clean.startsWith(kw))) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setVoiceActionToast("🎙️ Voice Command Executed: Stopped Speech Output.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 6. Read Aloud / Speak Latest Answer Commands
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

    // 7. Download / Export PDF Commands
    const downloadKeywords = ["download conversation", "export pdf", "download pdf", "export conversation", "save as pdf"];
    if (downloadKeywords.some((kw) => clean.includes(kw))) {
      handleDownloadConversation();
      setVoiceActionToast("🎙️ Voice Command Executed: Exported full conversation to PDF.");
      setTimeout(() => setVoiceActionToast(""), 4000);
      return true;
    }

    // 8. Delete Latest Question Commands
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
    } catch (err) {
      const message = formatErrorMessage(err?.response?.data?.detail, err?.message ? `Unable to reach assistant backend (${err.message}).` : "Unable to get response from assistant.");
      setError(message);
    } finally {
      setLoading(false);
    }
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

  const handleEditMessage = async (messageId, newText, newMode) => {
    setError("");

    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const previousMessages = messages.slice(0, msgIndex);

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
      {/* Desktop Sidebar */}
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
          onClearChat={handleClearChat}
          onSelectPrompt={handleSend}
          responseMode={responseMode}
          onSetResponseMode={setResponseMode}
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleCollapse={() => setDesktopSidebarOpen(false)}
        />
      </Box>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Sidebar
          onClearChat={() => {
            setMobileSidebarOpen(false);
            handleClearChat();
          }}
          onSelectPrompt={(prompt) => {
            setMobileSidebarOpen(false);
            handleSend(prompt);
          }}
          responseMode={responseMode}
          onSetResponseMode={setResponseMode}
          onOpenSettings={() => {
            setMobileSidebarOpen(false);
            setSettingsOpen(true);
          }}
        />
      </Drawer>

      {/* Main Chat Viewport */}
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
                  Welcome to MTI Knowledge Assistant
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
        onDeleteAllHistory={handleClearChat}
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