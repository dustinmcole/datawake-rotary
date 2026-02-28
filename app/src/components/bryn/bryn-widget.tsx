"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, X, Send, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrynChat } from "@/hooks/use-bryn-chat";

export function BrynWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isStreaming, sendMessage } = useBrynChat({
    agentContext: "member",
  });

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <>
      {/* Chat bubble trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition-all hover:scale-105 flex items-center justify-center z-40"
          title="Ask Bryn"
        >
          <Sparkles className="w-6 h-6 text-blue-400" />
        </button>
      )}

      {/* Mini chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 h-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold">Bryn</span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/portal/bryn"
                className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                title="Open full chat"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">
                  Ask me anything about the club!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "text-xs leading-relaxed rounded-xl px-3 py-2 max-w-[85%]",
                    msg.role === "user"
                      ? "bg-blue-600 text-white ml-auto rounded-br-md"
                      : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                  )}
                >
                  {msg.content || (
                    <span className="text-gray-400 italic">Thinking...</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Bryn..."
                className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-30 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
