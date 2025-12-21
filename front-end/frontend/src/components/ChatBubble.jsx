import React from "react";
import { cn } from "@/lib/utils";

const ChatBubble = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4 px-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-3 shadow-md transition-all",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none ml-12 p-5"
            : "bg-accent text-accent-foreground rounded-tl-none mr-12"
        )}
      >
        <p
          className={cn(
            "text-sm md:text-base leading-relaxed p-5",
            message.content === "..." && "animate-pulse"
          )}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
