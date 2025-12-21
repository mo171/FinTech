import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const ChatInput = ({ inputValue, setInputValue, onSend }) => {
  return (
    <div className="w-full border-t border-border bg-card p-4 pb-6 md:pb-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex gap-2 max-w-5xl mx-auto items-center w-full px-4"
      >
        <Input
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 h-12 px-6 rounded-full border-border focus-visible:ring-primary shadow-sm text-base"
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0 h-12 w-12 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
          disabled={!inputValue.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
