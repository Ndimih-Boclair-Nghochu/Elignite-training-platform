"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Send, Loader2, MessageCircle, Sparkles, Bot, User2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface AIHelperProps {
  className?: string;
}

const STARTER_PROMPTS = [
  "Hello",
  "Show me enrollment status",
  "How many programs do we have?",
  "Explain teacher dashboard tabs",
  "Give me fees overview",
];

export function AIHelper({ className }: AIHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiName, setAiName] = useState("EduAssistant");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const greeting = useMemo(
    () => `Hi! I’m ${aiName}. I run fully inside this system (no external AI API) and can answer based on your school database.`,
    [aiName]
  );

  useEffect(() => {
    fetch("/api/settings/ai-name")
      .then((r) => r.json())
      .then((data) => setAiName(data.aiName || "EduAssistant"))
      .catch(() => setAiName("EduAssistant"));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const pushAiMessage = (text: string) => {
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text,
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (response.ok) {
        const data = await response.json();
        pushAiMessage(data.response || "I’m here. Ask me anything about the platform.");
      } else {
        const error = await response.json();
        pushAiMessage(error.error || "Sorry, I encountered an error. Please try again.");
      }
    } catch (error) {
      pushAiMessage("Sorry, I’m having trouble connecting right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handlePromptClick = async (prompt: string) => {
    await sendMessage(prompt);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all",
            className
          )}
          title={`Open ${aiName}`}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-full max-w-md h-[34rem] flex flex-col shadow-2xl bg-white rounded-xl z-50 border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold leading-tight">{aiName}</h3>
                <p className="text-xs text-blue-100">On-device school assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded transition"
              aria-label="Close AI helper"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
                  <p className="font-medium mb-1">{greeting}</p>
                  <p className="text-xs text-slate-500">
                    I support basic conversation and role-aware school guidance like a rules-based assistant.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick prompts</p>
                  <div className="flex flex-wrap gap-2">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handlePromptClick(prompt)}
                        className="text-xs px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2", msg.sender === "user" ? "justify-end" : "justify-start")}>
                  {msg.sender === "ai" && (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mt-1">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] px-3 py-2 rounded-2xl text-sm shadow-sm",
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <p className={cn("text-[10px] mt-1", msg.sender === "user" ? "text-blue-100" : "text-slate-400")}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {msg.sender === "user" && (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mt-1">
                      <User2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 p-3 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about dashboard, fees, results, enrollment..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}
