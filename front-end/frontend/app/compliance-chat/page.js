"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUser } from "@/context/UserContext";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Loader2 } from "lucide-react";

export default function ComplianceChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Placeholder for policy text - can be moved to context or fetched
  const POLICY_TEXT = "Sample PDF This is a simple PDF file. Fun fun fun.";

  const processMessage = (text) => {
    /**
     * SUGGESTION: To use an LLM here, you could:
     * 1. Call a local API route that uses OpenAI/Gemini to pre-process the text.
     * 2. Use a browser-based LLM (like WebGPU models).
     * 3. Just format findings/metadata into the string as shown below.
     */
    return `is there text written you policyText ${POLICY_TEXT} ${text}`;
  };

  useEffect(() => {
    // initial mount logic if needed
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (!user || !conversationId) return;
    if (!conversationId) return;

    // Add user message to chat
    const userMessage = {
      id: uuidv4(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const processedText = processMessage(messageText);

      // Call the backend API with the new JSON structure
      const response = await api.post("api/compliance/evaluate", {
        query: processedText,
        conv: conversationId,
      });

      // Add AI response to chat
      // Adjusting based on standard response patterns or specific convId field
      const responseData = response.data;
      const aiResponseText =
        responseData.response || responseData.data?.response;
      const aiMessage = {
        id: uuidv4(),
        text: aiResponseText || "No response received.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update conversation ID from the backend response
      const newConvId =
        responseData.conversationId || responseData.data?.conversationId;
      if (newConvId) {
        setConversationId(newConvId);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");

      // Add error message to chat
      const errorMessage = {
        id: uuidv4(),
        text:
          error.message || "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between">
                <span>Compliance Assistant</span>
                <span className="text-sm font-normal text-gray-500">
                  {user?.email || "Demo Mode"}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-6 space-y-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Welcome to Compliance Chat
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Ask me anything about banking compliance, regulations, or
                    risk assessment. I'm here to help!
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isUser={message.sender === "user"}
                    />
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-gray-500 py-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>

            <div className="border-t p-4">
              <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
