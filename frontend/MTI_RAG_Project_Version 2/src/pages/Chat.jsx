import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Drawer, Stack, Typography } from "@mui/material";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import Message from "../Components/Message";
import ChatInput from "../Components/ChatInput";
import { askQuestion, clearSession, deleteHistoryItem, fetchHistory, getStoredUser, logoutUser } from "../services/api";

function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Hello! I am your MTI Knowledge Assistant. Ask any question regarding MTI training materials and meteorological documentation.",
      references: ["MTI Knowledge Base Index"],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [history, setHistory] = useState([]);

  const user = getStoredUser();

  const chatList = useMemo(
    () =>
      history.length
        ? history.map((item) => ({
            id: item.id,
            title: item.question,
          }))
        : [{ id: "current", title: "Current Chat" }],
    [history]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const records = await fetchHistory();
        setHistory(records);

        if (records.length > 0) {
          const mappedMessages = records
            .slice()
            .reverse()
            .flatMap((record) => [
              {
                id: `q-${record.id}`,
                role: "user",
                text: record.question,
                timestamp: new Date(record.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
              {
                id: `a-${record.id}`,
                role: "assistant",
                text: record.answer,
                references: record.sources,
                timestamp: new Date(record.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
          setMessages(mappedMessages);
        }
      } catch (err) {
        const message = err?.response?.data?.detail || "Unable to load chat history.";
        setError(message);
      }
    };

    loadHistory();
  }, []);

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
      const response = await askQuestion(text);

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
      const updatedHistory = await fetchHistory();
      setHistory(updatedHistory);
      setSelectedChatId(response.id);
    } catch (err) {
      const message = err?.response?.data?.detail || "Unable to get response from assistant.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    setMobileSidebarOpen(false);

    const record = history.find((h) => h.id === chatId);
    if (record) {
      const targetElement = document.getElementById(`q-${chatId}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteHistoryItem(chatId);
      const updatedHistory = await fetchHistory();
      setHistory(updatedHistory);

      setMessages((prev) => prev.filter((msg) => msg.id !== `q-${chatId}` && msg.id !== `a-${chatId}`));

      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to delete chat record.";
      setError(message);
    }
  };

  const handleNewChat = () => {
    setError("");
    setSelectedChatId(null);
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text: "New conversation initialized. Ask your MTI training question below.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setMobileSidebarOpen(false);
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
    <Box sx={{ height: "100vh", display: "flex", bgcolor: "#F8FAFC" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Sidebar
          chats={chatList}
          selectedChatId={selectedChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
        />
      </Box>

      <Drawer
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Sidebar
          chats={chatList}
          selectedChatId={selectedChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
        />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Navbar
          onToggleSidebar={() => setMobileSidebarOpen(true)}
          userName={user?.name || "MTI User"}
          onLogout={handleLogout}
        />

        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {messages.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
              Start a new conversation by typing your question.
            </Typography>
          ) : (
            <Stack spacing={2.5}>
              {messages.map((message) => (
                <div key={message.id} id={message.id}>
                  <Message
                    role={message.role}
                    text={message.text}
                    references={message.references}
                    timestamp={message.timestamp}
                  />
                </div>
              ))}

              {loading && (
                <Message
                  role="assistant"
                  text="Analyzing training material and retrieving relevant context..."
                  timestamp={new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                />
              )}
              <div ref={messagesEndRef} />
            </Stack>
          )}
        </Box>

        <ChatInput onSend={handleSend} disabled={loading} />
      </Box>
    </Box>
  );
}

export default Chat;