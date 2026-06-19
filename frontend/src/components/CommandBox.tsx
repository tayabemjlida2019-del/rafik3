'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, X, Maximize2, Minimize2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export default function CommandBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً سيدي المدير، أنا المساعد التنفيذي الذكي. أنا هنا لأحلل البيانات وأنفذ أوامرك. كيف يمكنني مساعدتك اليوم؟',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: userMsg.text })
      })
      
      const data = await res.json()
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || 'عذراً، حدث خطأ أثناء المعالجة.',
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'خطأ في الاتصال بالخادم. يرجى التأكد من تشغيل الـ Backend.',
        sender: 'ai',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'var(--grad-primary)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}
      >
        <Sparkles size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: 24,
              width: isExpanded ? '600px' : '380px',
              height: isExpanded ? '80vh' : '500px',
              maxHeight: 'calc(100vh - 48px)',
              maxWidth: 'calc(100vw - 48px)',
              background: 'rgba(10, 10, 26, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.1) inset',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1000,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(99, 102, 241, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '10px',
                  background: 'var(--grad-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>المساعد الذكي</h3>
                  <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    جاهز لتلقي الأوامر
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setIsExpanded(!isExpanded)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-start' : 'flex-end',
                    maxWidth: '85%'
                  }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                    borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
                    background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    border: msg.sender === 'ai' ? '1px solid var(--border)' : 'none',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    marginTop: 4,
                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                  }}>
                    {msg.timestamp.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-end' }}>
                  <div style={{
                    padding: '12px 16px', borderRadius: '16px', borderTopLeftRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)',
                    display: 'flex', gap: 6, alignItems: 'center'
                  }}>
                    <span className="live-dot" style={{ background: 'var(--primary)', animationDelay: '0s' }}></span>
                    <span className="live-dot" style={{ background: 'var(--primary)', animationDelay: '0.2s' }}></span>
                    <span className="live-dot" style={{ background: 'var(--primary)', animationDelay: '0.4s' }}></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid var(--border)',
              background: 'rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '8px 12px',
                gap: '10px'
              }}>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="أعطني أمراً أو اسألني... (مثال: حلل الضغط)"
                  rows={1}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    padding: '6px 0',
                    maxHeight: '100px',
                    minHeight: '24px'
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  style={{
                    background: inputValue.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    color: inputValue.trim() ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '8px',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputValue.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <Send size={16} style={{ transform: 'rotate(180deg)' }} /> {/* Rotate for RTL */}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
