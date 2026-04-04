"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader, MessageCircle, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ChatbotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState("new");
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation history on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/ai/chat");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversationId,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setConversationId(data.conversationId);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);

      // Refresh conversations
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setInput("");
    setConversationId("new");
    setShowHistory(false);
  };

  const loadConversation = (conv) => {
    setMessages(conv.messages || []);
    setConversationId(conv._id);
    setShowHistory(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
        title="AI Restaurant Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl w-96 max-h-[600px] flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">AI Restaurant Assistant</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-1 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Conversation Selector */}
      <div className="border-b px-4 py-2 flex gap-2">
        <button
          onClick={() => setShowHistory(false)}
          className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-sm font-medium"
        >
          Chat
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
        >
          History
        </button>
      </div>

      {/* Messages or History */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {showHistory ? (
          <div className="space-y-2">
            <button
              onClick={startNewConversation}
              className="w-full text-left px-3 py-2 bg-white rounded hover:bg-blue-50 text-sm font-medium text-blue-600 border border-blue-200"
            >
              + New Conversation
            </button>
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => loadConversation(conv)}
                className="w-full text-left px-3 py-2 bg-white rounded hover:bg-gray-100 text-sm border border-gray-200 transition"
              >
                <div className="font-medium text-gray-900 truncate">
                  {conv.title}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-600 mb-4">
                  Ask me anything about your restaurant!
                </p>
                <div className="space-y-1 text-left text-xs text-gray-500">
                  <p>• Revenue optimization</p>
                  <p>• Menu analysis</p>
                  <p>• Staff scheduling</p>
                  <p>• Customer strategies</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg">
                      <Loader className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      {!showHistory && (
        <div className="border-t p-4 bg-white rounded-b-2xl">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask for advice..."
              rows="2"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
