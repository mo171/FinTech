import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import axios from "axios";

const Chat = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [convoId, setConvoId] = useState("0");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = {
      id: Date.now(),
      content: inputValue,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");

    await getBotResponse(currentInput);
  };

  async function getBotResponse(message) {
    setIsTyping(true);
    try {
      // Get the raw token string from localStorage
      const authKey = "sb-bfahttrgzsruoinhbnjc-auth-token";
      const rawToken = localStorage.getItem(authKey);
      let token = "";

      if (rawToken) {
        try {
          // The token is stored as a JSON string in this project
          const parsed = JSON.parse(rawToken);
          token = parsed.access_token || "";
        } catch (e) {
          // Fallback if it's not JSON
          token = rawToken;
        }
      }

      const baseUrl = import.meta.env.VITE_BASE_URL;
      const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

      const response = await axios.post(
        `${normalizedBaseUrl}api/compliance/evaluate`,
        {
          message: message,
          convo: convoId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data.data;
      if (result) {
        setConvoId(result.conversationId);
        const botMessage = {
          id: Date.now() + 1,
          content: result.response,
          sender: "bot",
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Chat API Error:", error);

      // Determine error message based on error type
      let errorMessageContent =
        "Connection error. Please check if the server is running.";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessageContent =
            "Session expired or invalid. Please log in again.";
        } else if (error.response.data && error.response.data.message) {
          errorMessageContent = `Server error: ${error.response.data.message}`;
        }
      }

      const errorMessage = {
        id: Date.now() + 1,
        content: errorMessageContent,
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="p-4" style={{ padding: "10px" }}>
      <div className="flex flex-col h-[calc(100vh-80px)] w-full overflow-hidden bg-background">
        {/* Messages */}
        <div className="flex-1 overflow-hidden relative ">
          <ScrollArea className="h-full w-full py-4 pt-8 pb-32 ">
            <div className="max-w-4xl mx-auto w-full space-y-2 ">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isTyping && (
                <ChatBubble
                  message={{
                    id: "typing",
                    content: "...",
                    sender: "bot",
                  }}
                />
              )}
              <div ref={messagesEndRef} className="h-4 p-10" />
            </div>
          </ScrollArea>
        </div>
        {/* Input Area (Pinned to bottom) */}
        <div className="sticky bottom-0 w-full z-10">
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
