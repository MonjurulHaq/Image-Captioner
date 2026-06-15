import { useState, useRef, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAiChat } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_PROMPTS = [
  "আমার নীল ওয়ালেট হারিয়ে গেছে, কিভাবে রিপোর্ট করব?",
  "How do I claim a found item?",
  "আমি লাইব্রেরিতে একটি ল্যাপটপ পেয়েছি, কি করব?",
  "What are the steps to recover a lost ID card?",
];

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatMutation = useAiChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;

    const userMessage: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    chatMutation.mutate(
      {
        data: {
          message: msg,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        },
      },
      {
        onSuccess: (res: any) => {
          setMessages((prev) => [...prev, { role: "assistant", content: res.reply ?? res.message ?? "Sorry, I could not process that." }]);
        },
        onError: () => {
          setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-screen max-h-screen">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-sm font-bold">AI</span>
          </div>
          <div>
            <h1 className="font-bold">Sondhan AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Ask in Bengali or English &bull; Powered by Gemini</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8 mt-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-black text-accent">AI</span>
                </div>
                <h2 className="text-xl font-bold mb-1">Sondhan AI Assistant</h2>
                <p className="text-sm text-muted-foreground">
                  আমি বাংলায় বা ইংরেজিতে সাহায্য করতে পারি। আপনার হারানো বা পাওয়া জিনিস নিয়ে যেকোনো প্রশ্ন করুন।
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {EXAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    data-testid={`button-prompt-${i}`}
                    onClick={() => sendMessage(prompt)}
                    className="text-left bg-card border border-border rounded-lg p-3 text-sm hover:border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              data-testid={`message-${msg.role}-${i}`}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Textarea
              data-testid="input-message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="আপনার প্রশ্ন লিখুন... / Type your question..."
              rows={1}
              className="resize-none flex-1"
            />
            <Button
              data-testid="button-send"
              onClick={() => sendMessage()}
              disabled={chatMutation.isPending || !input.trim()}
            >
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </AppShell>
  );
}
