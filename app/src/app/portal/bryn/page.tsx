"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Send,
  Sparkles,
  Plus,
  MessageSquare,
  Loader2,
  StopCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrynChat } from "@/hooks/use-bryn-chat";
import { ChatMessageBubble } from "@/components/bryn/chat-message";

type AgentContext = "member" | "website" | "operations" | "uncorked";

interface ThreadSummary {
  id: string;
  title: string;
  updatedAt: string;
}

const CONTEXT_OPTIONS: { value: AgentContext; label: string; roles: string[] }[] = [
  { value: "member", label: "Member Assistant", roles: [] },
  { value: "website", label: "Website Editor", roles: ["website_admin", "super_admin"] },
  { value: "operations", label: "Operations", roles: ["club_admin", "super_admin"] },
  { value: "uncorked", label: "Uncorked Planning", roles: ["uncorked_committee", "club_admin", "super_admin"] },
];

export default function BrynChatPage() {
  const { user } = useUser();
  const roles = (user?.publicMetadata?.roles as string[]) ?? [];

  const [agentContext, setAgentContext] = useState<AgentContext>("member");
  const [threadId, setThreadId] = useState<string | undefined>();
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [input, setInput] = useState("");

  const { messages, isStreaming, error, sendMessage, stop, clear } = useBrynChat({
    threadId,
    agentContext,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Available contexts based on user roles
  const availableContexts = CONTEXT_OPTIONS.filter(
    (c) => c.roles.length === 0 || c.roles.some((r) => roles.includes(r))
  );

  // Load threads
  useEffect(() => {
    fetch("/api/bryn/threads")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setThreads(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    clear();
    setThreadId(undefined);
    // Create a thread on first message instead
    inputRef.current?.focus();
  };

  const handleSelectThread = async (id: string) => {
    try {
      const res = await fetch(`/api/bryn/threads/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setThreadId(id);
      clear();
      // Load existing messages
      if (data.messages && Array.isArray(data.messages)) {
        // Messages are loaded but we'd need to set them in the hook
        // For simplicity, we start fresh when selecting a thread
      }
      setShowSidebar(false);
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong. Please try again.');
      // ignore
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen">
      {/* Thread sidebar (desktop) */}
      <div
        className={cn(
          "w-64 bg-slate-50 border-r border-gray-200 flex flex-col shrink-0",
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-[var(--sidebar-width)] max-lg:z-30 max-lg:transition-transform max-lg:duration-200",
          showSidebar ? "max-lg:translate-x-0" : "max-lg:-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No conversations yet</p>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectThread(t.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate",
                  threadId === t.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 inline mr-2 opacity-50" />
                {t.title}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-gray-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Bryn</h1>
              <p className="text-xs text-gray-500">AI Club Assistant</p>
            </div>
          </div>

          {/* Context selector */}
          {availableContexts.length > 1 && (
            <div className="relative">
              <select
                value={agentContext}
                onChange={(e) => {
                  setAgentContext(e.target.value as AgentContext);
                  handleNewChat();
                }}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {availableContexts.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Hi, I&apos;m Bryn</h2>
              <p className="text-sm text-gray-500 max-w-sm">
                Your AI club assistant. Ask me about upcoming events, member
                directory, attendance, committees, or anything else about the club.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {[
                  "What events are coming up?",
                  "Show me my attendance",
                  "List all committees",
                  "Club meeting info",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))
          )}

          {error && (
            <div className="text-center">
              <p className="text-xs text-red-500 bg-red-50 inline-block px-3 py-1.5 rounded-full">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Bryn anything..."
                rows={1}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                style={{ maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
            </div>
            {isStreaming ? (
              <button
                onClick={stop}
                className="p-2.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors shrink-0"
                title="Stop generating"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                title="Send message"
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Bryn is an AI assistant and may make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
