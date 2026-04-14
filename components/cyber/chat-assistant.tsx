"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ChatResponse = {
  reply: string;
  recommendations: string[];
};

export function ChatAssistant() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState<ChatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function ask() {
    if (!message.trim()) {
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = (await response.json()) as ChatResponse;
      setAnswer(data);
      setMessage("");
    } catch {
      toast.error("Unable to query assistant");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-cyan-100">AI Phishing Assistant</h3>
      <p className="mt-1 text-sm text-slate-300">Ask: Is this link safe?</p>
      <div className="mt-4 flex gap-2">
        <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Paste a suspicious message or URL" />
        <Button onClick={ask} disabled={isLoading}>
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
      {answer ? (
        <div className="mt-4 space-y-2 text-sm text-slate-200">
          <p>{answer.reply}</p>
          <ul className="space-y-1 text-slate-300">
            {answer.recommendations.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
