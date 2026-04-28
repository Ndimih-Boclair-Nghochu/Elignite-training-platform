"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Inbox, Mail, MailOpen, Trash2, RefreshCw, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  fromName: string;
  fromEmail: string;
  fromRole: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ContactMessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        // Show only contact page messages (guest) + keep newest first
        const contact = (Array.isArray(data) ? data : [])
          .filter((m: Message) => m.fromRole === "guest" || m.fromRole === "contact")
          .sort((a: Message, b: Message) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMessages(contact);
      }
    } catch {
      toast({ title: "Failed to load messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function selectMessage(msg: Message) {
    setSelected(msg);
    if (!msg.read) {
      try {
        await fetch("/api/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: msg.id }),
        });
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
      } catch { /* silent */ }
    }
  }

  async function deleteMessage(id: number) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/contact/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selected?.id === id) setSelected(null);
        toast({ title: "Message deleted" });
      } else {
        toast({ title: "Failed to delete message", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to delete message", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  async function markAllRead() {
    const unread = messages.filter((m) => !m.read);
    await Promise.all(
      unread.map((m) =>
        fetch("/api/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: m.id }),
        })
      )
    );
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    toast({ title: "All messages marked as read" });
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="p-6 space-y-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Inbox className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          {unreadCount > 0 && (
            <Badge className="bg-blue-600 text-white">{unreadCount} new</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <MailOpen className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="h-14 w-14 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium text-lg">No contact messages yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Messages submitted through the website contact form will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[340px_1fr] gap-4 h-[calc(100vh-200px)] min-h-[500px]">
          {/* Message list */}
          <Card className="flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => selectMessage(msg)}
                  className={`w-full text-left px-4 py-4 transition-colors hover:bg-blue-50/60 ${
                    selected?.id === msg.id ? "bg-blue-50 border-l-2 border-blue-600" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                      <p className={`text-sm truncate ${!msg.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                        {msg.fromName}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className={`text-xs truncate ${!msg.read ? "font-medium text-slate-800" : "text-slate-600"}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{msg.body}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Message detail */}
          <Card className="flex flex-col overflow-hidden">
            {selected ? (
              <>
                {/* Detail header */}
                <div className="px-6 py-4 border-b bg-gray-50 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-950 truncate">{selected.subject}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{selected.fromName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${selected.fromEmail}`} className="hover:text-blue-600 hover:underline">
                          {selected.fromEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(selected.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => deleteMessage(selected.id)}
                      disabled={deleting === selected.id}
                    >
                      {deleting === selected.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => window.open(`mailto:${selected.fromEmail}?subject=Re: ${encodeURIComponent(selected.subject)}`, "_blank")}
                    >
                      <Mail className="mr-1.5 h-4 w-4" />
                      Reply via Email
                    </Button>
                  </div>
                </div>

                {/* Message body */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-2xl">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                      <p className="text-sm leading-8 text-slate-700 whitespace-pre-wrap">{selected.body}</p>
                    </div>
                    <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Reply to this message</p>
                        <p className="text-xs text-blue-700 mt-0.5">
                          Click <strong>Reply via Email</strong> above to open your email client with a pre-filled reply to{" "}
                          <a href={`mailto:${selected.fromEmail}`} className="underline">{selected.fromEmail}</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-10">
                <MailOpen className="h-14 w-14 text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">Select a message to read it</p>
                <p className="text-gray-400 text-sm mt-1">Click any message on the left to view the full content.</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
