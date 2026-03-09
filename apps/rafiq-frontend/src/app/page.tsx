"use client";

import { useState, useRef, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SuggestionItem = {
  id: string;
  resultType: "PLACE" | "LISTING" | "HOTEL";
  score: number;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  title?: string;
  city?: string;
  wilaya?: string;
  price?: number;
  basePrice?: number;
  rating?: number;
  avgRating?: number;
  categories?: string[];
  isUnesco?: boolean;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  suggestions?: SuggestionItem[];
  timestamp: Date;
};

const quickPrompts = [
  "🏛️ أريد زيارة مواقع تاريخية",
  "🏖️ شواطئ جميلة في الجزائر",
  "⛰️ مغامرة في الصحراء",
  "👨‍👩‍👧 رحلة عائلية بميزانية محدودة",
];

function ResultCard({ item }: { item: SuggestionItem }) {
  const name = item.nameAr || item.name || item.title || "—";
  const rating = item.rating || item.avgRating || 0;
  const price = item.price || item.basePrice;

  const typeLabel =
    item.resultType === "PLACE"
      ? "📍 موقع سياحي"
      : item.resultType === "HOTEL"
        ? "🏨 فندق"
        : "🏠 إقامة";

  const typeBg =
    item.resultType === "PLACE"
      ? "bg-emerald-500/20 text-emerald-400"
      : item.resultType === "HOTEL"
        ? "bg-blue-500/20 text-blue-400"
        : "bg-amber-500/20 text-amber-400";

  return (
    <div className="min-w-[260px] max-w-[280px] rounded-xl bg-[#1a2236] border border-[#1e293b] p-4 flex-shrink-0 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeBg}`}>
          {typeLabel}
        </span>
        <span className="text-xs text-[#94a3b8]">⭐ {rating.toFixed(1)}</span>
      </div>
      <h3 className="text-sm font-semibold text-[#f1f5f9] mb-1 line-clamp-2">{name}</h3>
      {item.wilaya && (
        <p className="text-xs text-[#94a3b8] mb-2">📍 {item.wilaya}</p>
      )}
      {item.isUnesco && (
        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
          🏆 تراث يونسكو
        </span>
      )}
      {price && (
        <p className="text-xs text-emerald-400 mt-2 font-medium">
          💰 {price.toLocaleString()} د.ج
        </p>
      )}
      {item.categories && item.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.categories.slice(0, 3).map((c) => (
            <span key={c} className="text-[10px] bg-[#111827] text-[#94a3b8] px-2 py-0.5 rounded-full">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-[#1e293b] rounded-2xl rounded-br-sm w-fit animate-fadeInUp">
      <span className="text-xs text-[#94a3b8]">رفيق يكتب</span>
      <div className="flex items-center">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "أهلاً بك في رفيق! 🌍\nأنا مرشدك السياحي الذكي لاكتشاف الجزائر. أخبرني عن نوع الرحلة التي تحلم بها وسأقترح لك أفضل الوجهات والفنادق.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.text,
        suggestions: data.suggestions,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "عذراً، حدث خطأ في الاتصال بالخادم. تأكد من تشغيل الـ API.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#111827]/80 backdrop-blur-md border-b border-[#1e293b] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-emerald-500/20">
            ر
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#f1f5f9]">رفيق</h1>
            <p className="text-xs text-emerald-400">المرشد السياحي الذكي 🟢</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} animate-fadeInUp`}
          >
            <div className={`max-w-[85%] md:max-w-[70%]`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user"
                    ? "bg-emerald-500 text-white rounded-bl-sm"
                    : "bg-[#1e293b] text-[#f1f5f9] rounded-br-sm"
                  }`}
              >
                {msg.text}
              </div>

              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 overflow-x-auto pb-2">
                  <div className="flex gap-3" style={{ direction: "rtl" }}>
                    {msg.suggestions.map((s) => (
                      <ResultCard key={s.id} item={s} />
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-[#475569] mt-1 px-1">
                {msg.timestamp.toLocaleTimeString("ar-DZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-end">
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 justify-center">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-xs px-4 py-2 rounded-full bg-[#1a2236] text-[#94a3b8] border border-[#1e293b] hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-200"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <footer className="px-4 pb-4 pt-2 bg-[#0a0e1a]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-3 bg-[#111827] rounded-2xl border border-[#1e293b] px-4 py-3 focus-within:border-emerald-500/50 transition-all duration-200"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل رفيق... مثلاً: أبحث عن أماكن تاريخية في باتنة"
            className="flex-1 bg-transparent text-sm text-[#f1f5f9] placeholder-[#475569] outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white disabled:opacity-30 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
