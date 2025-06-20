import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AISupportChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AISupportChat({ isOpen, onToggle }: AISupportChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your Commission Guard AI assistant. I can help you with commission protection strategies, contract questions, platform guidance, and real estate regulations. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isStayOpen, setIsStayOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/ai/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationHistory: messages.slice(-10) })
      });
      if (!response.ok) throw new Error("Failed to get AI response");
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm having trouble responding right now. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(currentMessage);
    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "How do I protect my commission if a client ghosts me?",
    "What should I include in my representation agreement?",
    "How does the public records monitoring work?",
    "What are the legal requirements for commission protection?",
    "How to handle contract breaches effectively?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setCurrentMessage(question);
  };

  const handleToggleClick = () => {
    if (isOpen) {
      onToggle();
      setIsStayOpen(false);
    } else {
      onToggle();
      setIsStayOpen(true);
    }
  };

  const showPreview = isHovered && !isOpen && !isStayOpen;
  const showFullChat = isOpen || isStayOpen;

  if (!showFullChat && !showPreview) {
    return (
      <div 
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          onClick={handleToggleClick}
          className="h-12 w-12 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Chat Button */}
      <motion.div
        className="absolute bottom-0 right-0"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleToggleClick}
          className="h-12 w-12 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </motion.div>

      <AnimatePresence>

        {/* Preview on Hover */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80"
          >
            <Card className="shadow-xl border-2 border-primary/20">
              <CardHeader className="pb-3 bg-primary text-white rounded-t-lg">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Commission Guard AI
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Hi! I can help you with commission protection strategies, contract questions, and platform guidance.
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Quick questions:</p>
                    {suggestedQuestions.slice(0, 2).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleSuggestedQuestion(question);
                          handleToggleClick();
                        }}
                        className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                      >
                        • {question}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Click the button to start chatting</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full Chat */}
        {showFullChat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-16 right-0 w-96"
          >
            <Card className="h-[600px] shadow-2xl flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-white rounded-t-lg flex-shrink-0">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Commission Guard AI
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onToggle();
                    setIsStayOpen(false);
                  }}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "400px" }}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === "assistant" && (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    )}
                    {message.role === "user" && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="p-4 border-t flex-shrink-0">
            <div className="text-sm text-gray-600 mb-3">Quick questions to get started:</div>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 text-xs p-2 h-auto w-full justify-start"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about commission protection..."
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || chatMutation.isPending}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            AI responses are for guidance only. Consult legal professionals for official advice.
          </div>
        </div>
      </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}