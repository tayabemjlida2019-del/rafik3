'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface ChatMessage {
    id: string;
    role: 'user' | 'bot';
    text: string;
    suggestions?: any[];
    quickReplies?: string[];
    actions?: { type: string; label: string; url: string }[];
    timestamp: Date;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Auto-focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
            setHasNewMessage(false);
        }
    }, [isOpen]);

    // Welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'bot',
                text: 'أهلاً بك في منصة الرفيق! 🌟\nأنا المساعد الذكي، كيف يمكنني مساعدتك؟',
                quickReplies: ['🏨 أبحث عن فندق', '🏠 أريد شقة للكراء', '🍲 أريد طعام', '🚕 أحتاج تاكسي', '❓ مساعدة'],
                timestamp: new Date(),
            }]);
        }
    }, [messages.length]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: text.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const { data } = await api.post('/ai/chat', { message: text.trim() });

            const botMsg: ChatMessage = {
                id: `bot-${Date.now()}`,
                role: 'bot',
                text: data.text,
                suggestions: data.suggestions,
                quickReplies: data.quickReplies,
                actions: data.actions,
                timestamp: new Date(),
            };

            // Simulate typing delay
            setTimeout(() => {
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);
                if (!isOpen) setHasNewMessage(true);
            }, 600);
        } catch (err) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: `err-${Date.now()}`,
                    role: 'bot',
                    text: '⚠️ عذراً، لم أتمكن من الاتصال بالخادم. تأكد من تشغيل المنصة.',
                    quickReplies: ['🔄 إعادة المحاولة', '❓ مساعدة'],
                    timestamp: new Date(),
                }]);
                setIsTyping(false);
            }, 500);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleQuickReply = (reply: string) => {
        sendMessage(reply);
    };

    // Render message text with bold markdown
    const renderText = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
                <div key={i} className={i > 0 ? 'mt-1' : ''}>
                    {parts.map((part, j) =>
                        j % 2 === 1
                            ? <strong key={j} className="text-white font-bold">{part}</strong>
                            : <span key={j}>{part}</span>
                    )}
                </div>
            );
        });
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group"
                style={{
                    background: 'linear-gradient(135deg, #C6A75E, #8C6B2E)',
                    boxShadow: '0 8px 32px rgba(198, 167, 94, 0.4)',
                }}
                aria-label="فتح المحادثة"
            >
                {isOpen ? (
                    <svg className="w-7 h-7 text-white transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <>
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {hasNewMessage && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-bounce text-white text-[10px] font-bold flex items-center justify-center">!</span>
                        )}
                    </>
                )}
                {/* Ripple effect */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-20"
                        style={{ background: 'linear-gradient(135deg, #C6A75E, #8C6B2E)' }}
                    />
                )}
            </button>

            {/* Chat Panel */}
            <div
                className={`fixed bottom-24 left-6 z-50 w-[380px] max-h-[600px] flex flex-col rounded-3xl overflow-hidden transition-all duration-500 ${
                    isOpen
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                }`}
                style={{
                    background: '#121417',
                    border: '1px solid rgba(198, 167, 94, 0.15)',
                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(198, 167, 94, 0.08)',
                }}
            >
                {/* Header */}
                <div className="px-5 py-4 flex items-center gap-3 border-b border-white/5"
                    style={{ background: 'linear-gradient(135deg, #1A1D22, #1F2329)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black text-white"
                        style={{ background: 'linear-gradient(135deg, #C6A75E, #8C6B2E)' }}>
                        ر
                    </div>
                    <div className="flex-1 text-right">
                        <h3 className="text-sm font-bold text-white">مساعد الرفيق</h3>
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 justify-end">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                            متصل الآن
                        </p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]" dir="rtl"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(198,167,94,0.2) transparent' }}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                msg.role === 'user'
                                    ? 'bg-gradient-to-br from-[#C6A75E] to-[#8C6B2E] text-white rounded-tl-md'
                                    : 'bg-[#1F2329] text-slate-300 border border-white/5 rounded-tr-md'
                            }`}>
                                {renderText(msg.text)}

                                {/* Suggestion Cards */}
                                {msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {msg.suggestions.slice(0, 3).map((s: any, i: number) => (
                                            <a
                                                key={i}
                                                href={s.link || '#'}
                                                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-right"
                                            >
                                                {s.image && (
                                                    <img src={s.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-white truncate">{s.title}</p>
                                                    {s.price && (
                                                        <p className="text-[10px] text-[#C6A75E]">{s.price?.toLocaleString()} دج</p>
                                                    )}
                                                </div>
                                                <svg className="w-4 h-4 text-slate-500 flex-shrink-0 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {msg.actions.map((action: any, i: number) => (
                                            <a
                                                key={i}
                                                href={action.url}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#C6A75E] bg-[#C6A75E]/10 border border-[#C6A75E]/20 hover:bg-[#C6A75E]/20 transition-colors"
                                            >
                                                {action.label} ←
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex justify-end">
                            <div className="bg-[#1F2329] border border-white/5 rounded-2xl rounded-tr-md px-4 py-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-[#C6A75E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-[#C6A75E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-[#C6A75E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}

                    {/* Quick Replies */}
                    {messages.length > 0 && messages[messages.length - 1].quickReplies && !isTyping && (
                        <div className="flex flex-wrap gap-2 justify-end">
                            {messages[messages.length - 1].quickReplies!.map((reply, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleQuickReply(reply)}
                                    className="text-[11px] font-bold px-3.5 py-2 rounded-xl border border-[#C6A75E]/20 text-[#C6A75E] hover:bg-[#C6A75E]/10 hover:border-[#C6A75E]/40 transition-all duration-200 active:scale-95"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 bg-[#1A1D22]">
                    <div className="flex items-center gap-2 bg-[#1F2329] rounded-xl px-3 py-1 border border-white/5 focus-within:border-[#C6A75E]/30 transition-colors">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="اكتب رسالتك هنا..."
                            className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2.5 placeholder:text-slate-600 text-right"
                            dir="rtl"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                            style={{
                                background: input.trim() ? 'linear-gradient(135deg, #C6A75E, #8C6B2E)' : 'transparent',
                            }}
                        >
                            <svg className="w-4 h-4 text-white rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
